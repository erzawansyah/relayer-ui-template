import { useMemo, useState } from "react";
import { type ContractState as ContractStateType } from "../types/manifest.d";

interface ContractStateProps {
    state: ContractStateType;

    /**
     * Optional: handler untuk membaca state via accessor function.
     * Kamu bisa inject logic wagmi/viem di parent.
     */
    onRead?: (args: {
        readFunction?: string;
        readArgs?: Array<"msg.sender" | string>;
        stateName: string;
    }) => Promise<string>;

    /**
     * Optional: handler untuk decrypt ciphertext (kalau terenkripsi).
     */
    onDecrypt?: (args: {
        ciphertext: string;
        encryptedType: string;
        stateName: string;
    }) => Promise<string>;
}

export default function ContractState({ state, onRead, onDecrypt }: ContractStateProps) {
    const [value, setValue] = useState<string>("");
    const [decryptedValue, setDecryptedValue] = useState<string | null>(null);
    const [loading, setLoading] = useState<"read" | "decrypt" | null>(null);
    const [error, setError] = useState<string>("");

    const label = state.ui?.label ?? state.name;
    const accessor = state.ui?.readFunction;
    const accessorArgs = state.ui?.readArgs ?? [];

    const subtitle = useMemo(() => {
        const parts: string[] = [];
        parts.push(state.solidityType);
        parts.push(state.visibility);
        if (state.isEncrypted) parts.push("encrypted");
        return parts.join(" • ");
    }, [state.solidityType, state.visibility, state.isEncrypted]);

    const canCall = !!accessor;
    const canDecrypt = state.isEncrypted && !!value && !!onDecrypt;

    const handleCall = async () => {
        setError("");
        setDecryptedValue(null);

        if (!accessor) {
            setError("No readFunction defined in state.ui.");
            return;
        }

        try {
            setLoading("read");

            if (onRead) {
                const result = await onRead({
                    readFunction: accessor,
                    readArgs: accessorArgs,
                    stateName: state.name,
                });
                setValue(result);
            } else {
                // Placeholder: kalau belum di-wire dari parent
                setValue("EncryptedValuePlaceholder");
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to read state.");
        } finally {
            setLoading(null);
        }
    };

    const handleDecrypt = async () => {
        setError("");
        if (!state.isEncrypted) return;
        if (!value) return;

        try {
            setLoading("decrypt");

            if (onDecrypt) {
                const clear = await onDecrypt({
                    ciphertext: value,
                    encryptedType: state.solidityType,
                    stateName: state.name,
                });
                setDecryptedValue(clear);
            } else {
                // Placeholder: kalau belum di-wire dari parent
                setDecryptedValue("DecryptedValuePlaceholder");
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Decrypt failed. Possibly missing permission.");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="rounded-lg p-4 bg-surface border border-surface-2">
            <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-fg truncate">{label}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-surface-2 text-fg-muted">
                            {subtitle}
                        </span>
                    </div>

                    {state.description ? (
                        <p className="mt-1 text-xs text-fg-muted line-clamp-2">{state.description}</p>
                    ) : null}

                    <div className="mt-2 text-[11px] text-fg-muted">
                        <span className="font-mono">
                            {canCall ? `read: ${accessor}()` : "read: none"}
                        </span>
                        {accessorArgs.length ? (
                            <span className="ml-2 font-mono">
                                args: [{accessorArgs.join(", ")}]
                            </span>
                        ) : null}
                    </div>
                </div>

                <button
                    onClick={handleCall}
                    disabled={!canCall || loading === "read"}
                    className="px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary-dark disabled:opacity-60"
                    title={!canCall ? "Add state.ui.readFunction in manifest to enable calling." : ""}
                >
                    {loading === "read" ? "Calling..." : "Call"}
                </button>
            </div>

            {error ? (
                <div className="mt-2 text-xs text-red-400">{error}</div>
            ) : null}

            {value ? (
                <div className="mt-3 p-2 flex justify-between items-center border border-surface-2 rounded-lg text-sm font-mono text-fg gap-3">
                    <div className="truncate">{value}</div>

                    {state.isEncrypted ? (
                        <button
                            onClick={handleDecrypt}
                            disabled={!canDecrypt || loading === "decrypt"}
                            className="shrink-0 px-2 py-1 bg-secondary text-white rounded-md text-xs hover:bg-secondary-dark disabled:opacity-60"
                            title={!onDecrypt ? "Decrypt handler not provided" : ""}
                        >
                            {loading === "decrypt" ? "Decrypting..." : "Decrypt"}
                        </button>
                    ) : null}
                </div>
            ) : null}

            {decryptedValue ? (
                <div className="mt-2 p-2 border border-surface-2 rounded-lg text-sm font-mono text-fg">
                    <span className="text-fg-muted mr-2">Decrypted:</span>
                    {decryptedValue}
                </div>
            ) : null}
        </div>
    );
}
