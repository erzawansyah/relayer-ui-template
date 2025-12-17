import { useMemo, useState } from "react";
import type {
    ContractFunction as ContractFunctionType,
    FunctionInput,
    SolidityType,
    ExternalEncryptedTypes,
    EncryptedTypes,
} from "../types/manifest.d";

// Sesuaikan path import ini dengan file field kamu
import {
    NumberField,
    BoolField,
    AddressField,
    TextField,
    BytesField,
    EncryptedInputField,
    ProofField,
    EncryptedOutputViewer,
    type EncryptedBundle,
    type Encryptor,
    type Decryptor,
} from "./FunctionFields";

type ReadCaller = (args: { functionName: string; args: unknown[] }) => Promise<unknown>;
type TxSender = (args: { functionName: string; args: unknown[]; valueWei?: string }) => Promise<{ txHash?: string }>;

interface ContractFunctionProps {
    fn: ContractFunctionType;

    // Inject dari parent (viem/wagmi wrapper)
    onRead?: ReadCaller;  // untuk view/pure
    onWrite?: TxSender;   // untuk nonpayable/payable

    // Inject dari parent (relayer/FHE client)
    encryptor?: Encryptor;
    decryptor?: Decryptor;
}

function isExternalEncrypted(t: SolidityType): t is ExternalEncryptedTypes {
    return t.startsWith("externalE");
}

function isEncryptedOutput(t: string): t is EncryptedTypes {
    return t.startsWith("e") && !t.startsWith("externalE");
}

function isBytesType(t: SolidityType) {
    return t === "bytes" || t === "bytes32";
}

function isNumberType(t: SolidityType) {
    return t.startsWith("uint") || t.startsWith("int");
}

function defaultInputValue(t: SolidityType) {
    if (t === "bool") return false;
    return "";
}

function resolveProofParam(fn: ContractFunctionType): string | null {
    const fromUi = fn.ui?.proofParam;
    if (fromUi) return fromUi;

    const bytesInputs = fn.inputs.filter((i) => i.type === "bytes");
    if (bytesInputs.length === 0) return null;

    const byName = bytesInputs.find((i) => i.name.toLowerCase().includes("proof"));
    if (byName) return byName.name;

    if (bytesInputs.length === 1) return bytesInputs[0].name;

    return null;
}

export default function ContractFunction({
    fn,
    onRead,
    onWrite,
    encryptor,
    decryptor,
}: ContractFunctionProps) {
    const proofParam = useMemo(() => resolveProofParam(fn), [fn]);
    const advancedInputs = useMemo(() => new Set(fn.ui?.advancedInputs ?? []), [fn.ui]);

    const isReadMode = fn.stateMutability === "view" || fn.stateMutability === "pure" || fn.type === "read";

    const [loading, setLoading] = useState<null | "call" | "tx">(null);
    const [error, setError] = useState<string>("");
    const [txHash, setTxHash] = useState<string>("");

    // Value untuk msg.value jika payable
    const [ethValueWei, setEthValueWei] = useState<string>(fn.ui?.defaultEthValueWei ?? "");

    // Simpan nilai input per param (untuk external ciphertext, simpan EncryptedBundle)
    const [values, setValues] = useState<Record<string, unknown>>(() => {
        const init: Record<string, unknown> = {};
        for (const input of fn.inputs) init[input.name] = defaultInputValue(input.type);
        return init;
    });

    // Output terakhir (untuk read)
    const [outputs, setOutputs] = useState<unknown>(null);

    function setField(name: string, v: unknown) {
        setValues((prev) => ({ ...prev, [name]: v }));
    }

    function labelForInput(input: FunctionInput) {
        return fn.ui?.inputLabels?.[input.name] ?? input.name;
    }

    function placeholderForInput(input: FunctionInput) {
        return fn.ui?.inputPlaceholders?.[input.name] ?? input.type;
    }

    function helpForInput(input: FunctionInput) {
        return fn.ui?.inputHelp?.[input.name];
    }

    // Bangun args untuk contract call/tx
    function buildArgs(): unknown[] {
        const args: unknown[] = [];

        for (const input of fn.inputs) {
            if (isExternalEncrypted(input.type)) {
                const bundle = values[input.name] as EncryptedBundle | null;
                args.push(bundle?.ciphertext ?? "");
                continue;
            }

            args.push(values[input.name]);
        }

        return args;
    }

    async function handleCallOrTx() {
        setError("");
        setTxHash("");

        try {
            setLoading(isReadMode ? "call" : "tx");

            const args = buildArgs();

            // Validasi minimal: external ciphertext harus ready
            for (const input of fn.inputs) {
                if (isExternalEncrypted(input.type)) {
                    const bundle = values[input.name] as EncryptedBundle | null;
                    if (!bundle?.ciphertext) {
                        throw new Error(`Input ${input.name} belum diencrypt.`);
                    }

                    if (proofParam) {
                        const proofName = proofParam;
                        const proofVal = values[proofName];
                        if (!proofVal) {
                            throw new Error(`Proof ${proofName} belum ada.`);
                        }
                    }
                }
            }

            if (isReadMode) {
                if (!onRead) throw new Error("onRead belum diprovide dari parent.");
                const result = await onRead({ functionName: fn.name, args });
                setOutputs(result);
            } else {
                if (!onWrite) throw new Error("onWrite belum diprovide dari parent.");
                const tx = await onWrite({
                    functionName: fn.name,
                    args,
                    valueWei: fn.payable ? (ethValueWei || "0") : "0",
                });
                if (tx?.txHash) setTxHash(tx.txHash);
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Gagal.");
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="rounded-lg p-4 bg-surface border border-surface-2">
            <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-fg truncate">{fn.name}</h4>

                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-surface-2 text-fg-muted">
                            {fn.visibility} • {fn.stateMutability ?? "nonpayable"} • {fn.payable ? "payable" : "no ETH"}
                        </span>
                    </div>

                    {fn.description ? (
                        <p className="mt-1 text-xs text-fg-muted line-clamp-2">{fn.description}</p>
                    ) : null}
                </div>

                <button
                    onClick={handleCallOrTx}
                    disabled={loading !== null}
                    className="px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary-dark disabled:opacity-60"
                >
                    {loading
                        ? isReadMode
                            ? "Calling..."
                            : "Sending..."
                        : isReadMode
                            ? "Call"
                            : "Send Tx"}
                </button>
            </div>

            {/* Inputs */}
            {fn.inputs.length ? (
                <div className="mt-4 space-y-3">
                    {fn.inputs.map((input) => {
                        const isProof = proofParam === input.name && input.type === "bytes";
                        const isAdvanced = advancedInputs.has(input.name);

                        // Compact: advanced disembunyikan (tapi tetap dipakai). Kalau kamu mau toggle, bisa tambah state showAdvanced.
                        if (isAdvanced && !isProof) {
                            return null;
                        }

                        // external encrypted
                        if (isExternalEncrypted(input.type)) {
                            return (
                                <EncryptedInputField
                                    key={input.name}
                                    label={labelForInput(input)}
                                    name={input.name}
                                    encryptedType={input.type}
                                    encryptor={encryptor ?? (async () => { throw new Error("encryptor belum diprovide."); })}
                                    value={values[input.name] as EncryptedBundle | null}
                                    onChange={(bundle) => {
                                        setField(input.name, bundle);

                                        // auto bind proof jika ada proofParam
                                        if (proofParam && bundle?.proof) {
                                            setField(proofParam, bundle.proof);
                                        }
                                        if (proofParam && !bundle) {
                                            setField(proofParam, "");
                                        }
                                    }}
                                    helperText={helpForInput(input)}
                                />
                            );
                        }

                        // proof bytes
                        if (isProof) {
                            return (
                                <ProofField
                                    key={input.name}
                                    label={labelForInput(input)}
                                    name={input.name}
                                    value={values[input.name] as string}
                                    onChange={(v) => setField(input.name, v)}
                                    mode="readonly"
                                />
                            );
                        }

                        // bytes
                        if (isBytesType(input.type)) {
                            return (
                                <BytesField
                                    key={input.name}
                                    label={labelForInput(input)}
                                    name={input.name}
                                    value={values[input.name] as string}
                                    onChange={(v) => setField(input.name, v)}
                                    placeholder={placeholderForInput(input)}
                                />
                            );
                        }

                        // bool
                        if (input.type === "bool") {
                            return (
                                <BoolField
                                    key={input.name}
                                    label={labelForInput(input)}
                                    name={input.name}
                                    value={values[input.name] as boolean}
                                    onChange={(v) => setField(input.name, v)}
                                />
                            );
                        }

                        // address
                        if (input.type === "address") {
                            return (
                                <AddressField
                                    key={input.name}
                                    label={labelForInput(input)}
                                    name={input.name}
                                    value={values[input.name] as string}
                                    onChange={(v) => setField(input.name, v)}
                                    placeholder={placeholderForInput(input)}
                                />
                            );
                        }

                        // string
                        if (input.type === "string") {
                            return (
                                <TextField
                                    key={input.name}
                                    label={labelForInput(input)}
                                    name={input.name}
                                    value={values[input.name] as string}
                                    onChange={(v) => setField(input.name, v)}
                                    placeholder={placeholderForInput(input)}
                                />
                            );
                        }

                        // number types
                        if (isNumberType(input.type)) {
                            return (
                                <NumberField
                                    key={input.name}
                                    label={labelForInput(input)}
                                    name={input.name}
                                    solidityType={input.type}
                                    value={values[input.name] as string}
                                    onChange={(v) => setField(input.name, v)}
                                    placeholder={placeholderForInput(input)}
                                    helperText={helpForInput(input)}
                                />
                            );
                        }

                        // fallback
                        return (
                            <TextField
                                key={input.name}
                                label={labelForInput(input)}
                                name={input.name}
                                value={String(values[input.name] ?? "")}
                                onChange={(v) => setField(input.name, v)}
                                placeholder={placeholderForInput(input)}
                            />
                        );
                    })}

                    {/* Payable value */}
                    {fn.payable ? (
                        <NumberField
                            label="ETH value (wei)"
                            name="__eth_value_wei"
                            solidityType="uint256"
                            value={ethValueWei}
                            onChange={setEthValueWei}
                            helperText="Akan dipakai sebagai msg.value untuk transaksi."
                            placeholder="0"
                        />
                    ) : null}

                    {/* Advanced proof field hidden by default but still used:
              Kalau proof masuk advancedInputs, tetap render ProofField agar field terpakai
           */}
                    {proofParam && advancedInputs.has(proofParam) ? (
                        <div className="mt-2">
                            <ProofField
                                label={fn.ui?.inputLabels?.[proofParam] ?? proofParam}
                                name={proofParam}
                                value={values[proofParam] as string}
                                onChange={(v) => setField(proofParam, v)}
                                mode="readonly"
                            />
                        </div>
                    ) : null}
                </div>
            ) : null}

            {/* Errors */}
            {error ? <div className="mt-3 text-xs text-red-400">{error}</div> : null}

            {/* Tx hash */}
            {txHash ? (
                <div className="mt-3 text-xs text-fg-muted">
                    tx: <span className="font-mono text-fg">{txHash}</span>
                </div>
            ) : null}

            {/* Outputs */}
            {fn.outputs.length ? (
                <div className="mt-4">
                    <div className="text-xs text-fg-muted mb-2">Outputs</div>

                    <div className="space-y-2">
                        {fn.outputs.map((out, idx) => {
                            const outLabel = out.name || `output_${idx}`;
                            const outType = out.type;

                            // Kalau output encrypted, tampilkan viewer decrypt
                            if (isEncryptedOutput(outType)) {
                                const ciphertext =
                                    (outputs as Record<string, unknown>)?.[out.name] ??
                                    (Array.isArray(outputs) ? outputs[idx] : outputs) ??
                                    "";

                                return (
                                    <EncryptedOutputViewer
                                        key={`${outLabel}-${idx}`}
                                        label={outLabel}
                                        encryptedType={outType}
                                        ciphertext={String(ciphertext ?? "")}
                                        decryptor={decryptor ?? (async () => { throw new Error("decryptor belum diprovide."); })}
                                        helperText="Jika decrypt gagal, kemungkinan kamu belum punya permission."
                                    />
                                );
                            }

                            // Output non-encrypted
                            const val =
                                (outputs as Record<string, unknown>)?.[out.name] ??
                                (Array.isArray(outputs) ? outputs[idx] : outputs) ??
                                "";

                            return (
                                <div
                                    key={`${outLabel}-${idx}`}
                                    className="p-2 border border-surface-2 rounded-lg text-sm font-mono text-fg flex justify-between"
                                >
                                    <span className="text-fg-muted">{outLabel}</span>
                                    <span className="truncate">{String(val ?? "")}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
