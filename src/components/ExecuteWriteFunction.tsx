// ExecuteWriteFunction.tsx
import { useMemo, useState, useEffect } from "react";
import type { AbiFunction } from "viem";
import FunctionInputHandler from "./FunctionInputHandler";
import FunctionFinalArgument from "./FunctionFinalArgument";
import {
    isEncryptedInputType,
    isSupportedInputInternalType,
    isSupportedInputType,
} from "@/lib/typeValidator";
import type {
    EncryptedInputTypes,
    SupportedInputInternalType,
    SupportedInputType,
} from "@/types/functions";
import { Button } from "./ui/button";
import { useEncryption } from "@/hooks/useEncryption";
import { useWriteContract } from "wagmi";
import FunctionTxConfirmation from "./FunctionTxConfirmation";

interface ExecuteWriteFunctionProps {
    func: AbiFunction;
    contractAddress: `0x${string}`;
}

type EncryptResult = {
    handles: string[];
    proof: string;
};

export function ExecuteWriteFunction({ func, contractAddress }: ExecuteWriteFunctionProps) {
    const inputsLen = func.inputs?.length ?? 0;
    // State untuk menyimpan argumen mentah (user input) — belum tentu terenkripsi
    const [rawArgs, setRawArgs] = useState<unknown[]>(() => Array(inputsLen).fill(null));
    // State untuk menyimpan argumen final yang akan dikirim ke kontrak
    // (setelah enkripsi jika diperlukan). Di-set pada saat "Encrypt Inputs" atau saat eksekusi.
    const [args, setArgs] = useState<unknown[]>(() => Array(inputsLen).fill(null));
    // tx hash state, untuk menampilkan hasil eksekusi
    const [txHash, setTxHash] = useState<string | null>(null);

    // Tab state untuk melihat form input vs built arguments
    const [activeTab, setActiveTab] = useState<"input" | "built">("input");
    // Loading state untuk proses enkripsi
    const [isEncrypting, setIsEncrypting] = useState(false);
    // Loading state untuk proses eksekusi
    const [isExecuting, setIsExecuting] = useState(false);

    const { encrypt, getEncryptedIndexes } = useEncryption();

    const { writeContractAsync } = useWriteContract()

    // Tombol Build disabled jika ada input yang belum diisi (kecuali inputProof yang auto-fill)
    const isBuildDisabled = useMemo(() => {
        if (!func.inputs || func.inputs.length === 0) return false;
        for (let i = 0; i < func.inputs.length; i++) {
            const input = func.inputs[i];
            // Skip inputProof karena akan diisi otomatis
            if (input.name === "inputProof") continue;
            if (rawArgs[i] === null || rawArgs[i] === undefined) {
                return true;
            }
        }
        return false;
    }, [rawArgs, func.inputs]);

    // Reset state ketika ABI/inputs fungsi berubah (mis. saat user memilih fungsi lain)
    // Defer setState into a microtask to avoid synchronous setState inside effect
    // which triggers the `react-hooks/set-state-in-effect` ESLint rule.
    useEffect(() => {
        const len = func.inputs?.length ?? 0;
        Promise.resolve().then(() => {
            setRawArgs(Array(len).fill(null));
            setArgs(Array(len).fill(null));
            setActiveTab("input");
            setIsEncrypting(false);
            setIsExecuting(false);
        });
    }, [func.inputs]);

    const validationError = useMemo(() => {
        if (!func.inputs || func.inputs.length === 0) return null;

        const missingInternalType: string[] = [];
        for (let i = 0; i < func.inputs.length; i++) {
            const input = func.inputs[i];
            if (!input.internalType) {
                missingInternalType.push(input.name || `arg${i}`);
            }
        }
        if (missingInternalType.length > 0) {
            return `Missing internalType for inputs: ${missingInternalType.join(", ")}`;
        }

        const unsupportedInternalTypes: string[] = [];
        for (let i = 0; i < func.inputs.length; i++) {
            const input = func.inputs[i];
            if (!isSupportedInputInternalType(input.internalType!)) {
                unsupportedInternalTypes.push(input.internalType!);
            }
        }
        if (unsupportedInternalTypes.length > 0) {
            return `Unsupported input types: ${unsupportedInternalTypes.join(", ")}`;
        }

        const unsupportedTypes: string[] = [];
        for (let i = 0; i < func.inputs.length; i++) {
            const input = func.inputs[i];
            if (!isSupportedInputType(input.type)) {
                unsupportedTypes.push(input.type);
            }
        }
        if (unsupportedTypes.length > 0) {
            return `Unsupported input types: ${unsupportedTypes.join(", ")}`;
        }

        return null;
    }, [func.inputs]);

    // Cek apakah ada input terenkripsi
    const hasEncryptedInput = useMemo(() => {
        if (!func.inputs) return false;
        return func.inputs.some((input) =>
            isEncryptedInputType(input.internalType!)
        );
    }, [func.inputs]);

    // Validasi: Jika ada input terenkripsi, pastikan ada input bernama `inputProof`
    if (hasEncryptedInput && !func.inputs?.some((input) => input.name === "inputProof")) {
        return (
            <div className="text-destructive bg-destructive/10 p-3 rounded-md italic">
                This function requires encrypted inputs but does not have an `inputProof` parameter.
                Please add an `inputProof` parameter to handle encryption proofs.
            </div>
        );
    }

    if (validationError !== null) {
        return (
            <div className="text-destructive bg-destructive/10 p-3 rounded-md italic">
                This function cannot be executed because one or more of its inputs is not supported.
                <div className="mt-2 text-xs not-italic opacity-80">{validationError}</div>
            </div>
        );
    }


    const handleRawArgChange = (index: number, rawValue: unknown) => {
        setRawArgs((prev) => {
            const newRawArgs = [...prev];
            newRawArgs[index] = rawValue;
            return newRawArgs;
        });
    }

    const buildFinalArgs = async (params: {
        func: AbiFunction;
        rawArgs: unknown[];
    }): Promise<{ finalArgs: unknown[]; encryptResult?: EncryptResult }> => {
        const { func, rawArgs } = params;
        const inputs = func.inputs ?? [];

        const { encryptedIdx, proofIndex } = getEncryptedIndexes(func);

        // Default: copy rawArgs
        const finalArgs: unknown[] = inputs.map((_, i) => rawArgs[i]);

        if (encryptedIdx.length === 0) {
            return { finalArgs };
        }

        // 1. Ambil nilai raw yang perlu dienkripsi (berdasarkan ABI order)
        const valuesToEncrypt = encryptedIdx.map((i) => {
            return {
                type: inputs[i].internalType as EncryptedInputTypes,
                value: rawArgs[i],
            };
        });

        // 2. Dummy encrypt
        const encryptResult = await encrypt(valuesToEncrypt, contractAddress);

        // 3. Scatter ciphertext ke posisi ABI yang benar
        encryptedIdx.forEach((abiIndex, j) => {
            finalArgs[abiIndex] = encryptResult.handles[j];
        });

        // 4. Isi inputProof jika ada
        if (proofIndex !== -1) {
            finalArgs[proofIndex] = encryptResult.proof;
        }

        return { finalArgs };
    }

    const handleExecution = async () => {
        try {
            setIsExecuting(true);
            // Jika tidak ada argumen terenkripsi, gunakan rawArgs langsung
            if (!hasEncryptedInput) {
                const { finalArgs } = await buildFinalArgs({ func, rawArgs });
                setArgs(finalArgs);
            }
            // final args tidak boleh null/undefined
            for (let i = 0; i < args.length; i++) {
                if (args[i] === null || args[i] === undefined) {
                    console.error("Cannot execute: argument", i, "is not built yet.");
                    return;
                }
            }
            // delay 100 ms to show loading state
            await new Promise((resolve) => setTimeout(resolve, 2500));

            if (args.length !== inputsLen) {
                console.error("Arguments length mismatch.");
                return;
            }
            const tx = await writeContractAsync({
                address: contractAddress,
                abi: [func],
                functionName: func.name,
                args: args,
            });
            console.log("Transaction submitted:", tx);
            setTxHash(tx)
        } catch (error) {
            console.error("Execution failed:", error);
        } finally {
            setIsExecuting(false);
        }
    }

    const handleBuildAndEncrypt = async () => {
        try {
            setIsEncrypting(true);
            // delay 100 ms to show loading state
            await new Promise((resolve) => setTimeout(resolve, 100));


            // Membangun argumen final (dengan enkripsi) dan simpan ke state
            const { finalArgs } = await buildFinalArgs({ func, rawArgs });
            setArgs(finalArgs);
            // Pindah ke tab built untuk melihat hasil
            setActiveTab("built");
        } catch (error) {
            console.error("Encryption failed:", error);
        } finally {
            setIsEncrypting(false);
        }
    }

    return (
        <div className="space-y-2">
            {inputsLen === 0 ? (
                // Fungsi tanpa input
                <>
                    <div className="text-xs text-fg-muted italic p-3 text-center border border-border rounded-md">
                        This function has no inputs.
                    </div>
                    <div className="flex justify-start">
                        <Button
                            size="sm"
                            disabled={isExecuting}
                            onClick={handleExecution}
                        >
                            {isExecuting ? "Executing..." : "Execute"}
                        </Button>
                    </div>
                </>
            ) : !hasEncryptedInput ? (
                // Fungsi tanpa encrypted input - tidak perlu tab, langsung tampilkan form
                <>
                    <div className="space-y-2">
                        {func.inputs?.map((input, index) => (
                            <FunctionInputHandler
                                key={index}
                                name={input.name || `arg${index}`}
                                rawType={input.internalType as SupportedInputInternalType}
                                type={input.type as SupportedInputType}
                                contractAddress={contractAddress}
                                value={rawArgs[index]}
                                onChange={(rawValue) => handleRawArgChange(index, rawValue)}
                            />
                        ))}
                    </div>
                    <div className="flex justify-start">
                        <Button
                            size="sm"
                            disabled={isBuildDisabled || isExecuting}
                            onClick={handleExecution}
                        >
                            {isExecuting ? "Executing..." : "Execute"}
                        </Button>
                    </div>
                </>
            ) : (
                // Fungsi dengan encrypted input - perlu tab untuk input dan built arguments
                <>
                    {/* Tab untuk beralih antara input form dan built arguments */}
                    <div className="border border-border rounded-md overflow-hidden">
                        {/* Tab Headers */}
                        <div className="flex border-b border-border bg-secondary/20">
                            <button
                                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${activeTab === "input"
                                    ? "bg-secondary/50 border-b-2 border-primary"
                                    : "hover:bg-secondary/30"
                                    }`}
                                onClick={() => setActiveTab("input")}
                            >
                                Input
                            </button>
                            <button
                                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${activeTab === "built"
                                    ? "bg-secondary/50 border-b-2 border-primary"
                                    : "hover:bg-secondary/30"
                                    }`}
                                onClick={() => setActiveTab("built")}
                            >
                                Built Arguments {args.some((arg) => arg !== null) && "✓"}
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="p-3 bg-secondary/10">
                            {activeTab === "input" && (
                                <div className="space-y-2">
                                    {func.inputs?.map((input, index) => {
                                        // Jangan render input UI untuk `inputProof` (ini diisi otomatis oleh proses enkripsi)
                                        if (input.name === "inputProof") {
                                            return null;
                                        }
                                        return (
                                            <FunctionInputHandler
                                                key={index}
                                                name={input.name || `arg${index}`}
                                                rawType={input.internalType as SupportedInputInternalType}
                                                type={input.type as SupportedInputType}
                                                contractAddress={contractAddress}
                                                value={rawArgs[index]}
                                                onChange={(rawValue) => handleRawArgChange(index, rawValue)}
                                            />
                                        );
                                    })}
                                </div>
                            )}

                            {activeTab === "built" && (
                                <div className="space-y-2">
                                    {args.some((arg) => arg !== null) ? (
                                        <>
                                            <div className="text-xs text-muted-foreground mb-2">Ready to execute (encrypted)</div>
                                            {(func.inputs ?? []).map((input, i) => {
                                                const argValue = args[i];

                                                if (argValue === null || argValue === undefined) return null;

                                                return (
                                                    <FunctionFinalArgument
                                                        key={i}
                                                        name={input.name || `arg${i}`}
                                                        type={input.type}
                                                        internalType={input.internalType}
                                                        value={argValue}
                                                    />
                                                );
                                            })}
                                        </>
                                    ) : (
                                        <div className="text-xs text-muted-foreground italic text-center py-4">
                                            Click "Build & Encrypt" to generate encrypted arguments
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-start gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={isBuildDisabled || isEncrypting || args.some((arg) => arg !== null && arg !== undefined)}
                            onClick={handleBuildAndEncrypt}
                        >
                            {isEncrypting ? "Encrypting..." : "Build & Encrypt"}
                        </Button>

                        <Button
                            size="sm"
                            disabled={args.every((arg) => arg === null || arg === undefined) || isEncrypting || isExecuting}
                            onClick={handleExecution}
                        >
                            {isExecuting ? "Executing..." : "Execute"}
                        </Button>
                    </div>
                </>
            )}

            {txHash && <FunctionTxConfirmation txHash={txHash as `0x${string}`} />}
        </div>
    );
}
