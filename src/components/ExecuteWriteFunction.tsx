// ExecuteWriteFunction.tsx
import { useMemo, useState } from "react";
import type { AbiFunction } from "viem";
import FunctionInputHandler from "./FunctionInputHandler";
import {
    isEncryptedInputType,
    isSupportedInputInternalType,
    isSupportedInputType,
} from "@/lib/typeValidator";
import type {
    SupportedInputInternalType,
    SupportedInputType,
} from "@/types/functions";
import { Button } from "./ui/button";

interface ExecuteWriteFunctionProps {
    func: AbiFunction;
    contractAddress: `0x${string}`;
}

type EncryptResult = {
    handles: string[];
    proof: string;
};

function encrypt(values: unknown[]): EncryptResult {
    const handles = values.map((val, i) => {
        return `enc_${i}_${String(val)}`;
    });

    return {
        handles,
        proof: "dummy-proof",
    };
}


function getEncryptedIndexes(func: AbiFunction) {
    const inputs = func.inputs ?? [];
    const encryptedIdx: number[] = [];
    let proofIndex = -1;

    inputs.forEach((inp, i) => {
        if (inp.name === "inputProof") proofIndex = i;
        if (inp.internalType && isEncryptedInputType(inp.internalType)) {
            encryptedIdx.push(i);
        }
    });

    return { encryptedIdx, proofIndex };
}

export function ExecuteWriteFunction({ func, contractAddress }: ExecuteWriteFunctionProps) {
    const inputsLen = func.inputs?.length ?? 0;
    //  State untuk menyimpan argumen mentah dan belum terenkripsi (jika ada)
    const [rawArgs, setRawArgs] = useState<unknown[]>(() => Array(inputsLen).fill(null));
    // State untuk menyimpan argumen final yang akan dikirim ke kontrak (setelah enkripsi jika perlu)
    const [args, setArgs] = useState<unknown[]>(() => Array(inputsLen).fill(null));

    const isDisabled = useMemo(() => {
        if (!func.inputs || func.inputs.length === 0) return false;
        for (let i = 0; i < func.inputs.length; i++) {
            if (args[i] === null || args[i] === undefined) {
                return true;
            }
        }
        return false;
    }, [args, func.inputs]);

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

    const buildFinalArgs = (params: {
        func: AbiFunction;
        rawArgs: unknown[];
    }): { finalArgs: unknown[]; encryptResult?: EncryptResult } => {
        const { func, rawArgs } = params;
        const inputs = func.inputs ?? [];

        const { encryptedIdx, proofIndex } = getEncryptedIndexes(func);

        // Default: copy rawArgs
        const finalArgs: unknown[] = inputs.map((_, i) => rawArgs[i]);

        if (encryptedIdx.length === 0) {
            return { finalArgs };
        }

        // 1. Ambil nilai raw yang perlu dienkripsi (berdasarkan ABI order)
        const valuesToEncrypt = encryptedIdx.map((i) => rawArgs[i]);

        // 2. Dummy encrypt
        const encryptResult = encrypt(valuesToEncrypt);

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




    return (
        <div className="space-y-2">
            {inputsLen === 0 ? (
                <div className="text-xs text-fg-muted italic">
                    This function has no inputs.
                </div>
            ) : (
                func.inputs?.map((input, index) => {
                    if (input.name === "inputProof") {
                        return
                    } else {
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
                    }
                })
            )}
            <div className="flex justify-start">
                {
                    !hasEncryptedInput ? null : (
                        <Button size="sm" variant="outline" className="mr-2" onClick={() => {
                            const { finalArgs } = buildFinalArgs({ func, rawArgs });
                            setArgs(finalArgs);
                        }}>
                            {
                                hasEncryptedInput ? "Encrypt Inputs" : "Prepare Inputs"
                            }
                        </Button>
                    )
                }

                <Button size="sm" disabled={isDisabled} onClick={() => {
                    console.log("Executing write function with args:", args);
                }}>
                    Execute
                </Button>
            </div>

            {/* Tampilkan final args */}
            {args.some((arg) => arg !== null) && (
                <div className="p-3 bg-secondary/30 border border-border rounded-md">
                    <div className="text-sm font-semibold mb-2">Final Arguments:</div>
                    <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(args, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
