// ExecuteWriteFunction.tsx
import { useState } from "react";
import type { AbiFunction } from "viem";
import FunctionInputHandler from "./FunctionInputHandler";
import FunctionFinalArgument from "./FunctionFinalArgument";

import type {
    SupportedInputInternalType,
    SupportedInputType,
} from "@/types/functions";
import { Button } from "./ui/button";
import { useWriteContract } from "wagmi";
import FunctionTxConfirmation from "./FunctionTxConfirmation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useInputPreparation } from "@/hooks/useInputPreparation";
import { toast } from "sonner";

interface ExecuteWriteFunctionProps {
    func: AbiFunction;
    contractAddress: `0x${string}`;
}

export function ExecuteWriteFunction({ func, contractAddress }: ExecuteWriteFunctionProps) {
    const {
        inputsLen,
        args,
        rawArgs,
        isPrepared,
        hasEncryptedInput,
        errors: validationError,
        handleRawArgChange,
        handleArgsChange,
        prepareFinalArgs,
    } = useInputPreparation({
        function: func,
        contractAddress: contractAddress,
    })
    // State untuk menyimpan hash transaksi setelah eksekusi
    const [txHash, setTxHash] = useState<string | null>(null);
    // Tab state untuk melihat form input vs built arguments
    const [activeTab, setActiveTab] = useState<"input" | "built">("input");
    // Loading state untuk proses enkripsi
    const [isEncrypting, setIsEncrypting] = useState(false);
    // Loading state untuk proses eksekusi
    const [isExecuting, setIsExecuting] = useState(false);


    const { writeContractAsync } = useWriteContract();


    const handleExecution = async () => {
        try {
            setIsExecuting(true);
            // small delay so button state updates visually
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Determine the arguments we'll execute with. Use local variable
            // to avoid relying on async state updates (race conditions).
            let executeArgs: unknown[] = args;

            // If there are no inputs at all, prepareFinalArgs to get canonical empty args
            if (inputsLen === 0) {
                const finalArgs = await prepareFinalArgs();
                executeArgs = finalArgs;
                for (let i = 0; i < finalArgs.length; i++) {
                    handleArgsChange(i, finalArgs[i]);
                }
            } else if (!hasEncryptedInput) {
                // Non-encrypted path: always prepare final args from raw inputs
                const finalArgs = await prepareFinalArgs();
                executeArgs = finalArgs;
                for (let i = 0; i < finalArgs.length; i++) {
                    handleArgsChange(i, finalArgs[i]);
                }
            } else {
                // Encrypted path: if built args are not present, build them now
                const hasBuiltArgs = args.some((arg) => arg !== null && arg !== undefined);
                if (!hasBuiltArgs) {
                    const finalArgs = await prepareFinalArgs();
                    executeArgs = finalArgs;
                    for (let i = 0; i < finalArgs.length; i++) {
                        handleArgsChange(i, finalArgs[i]);
                    }
                    // switch to built tab so user sees resulting args
                    setActiveTab("built");
                } else {
                    executeArgs = args;
                }
            }

            // Basic readiness check: ensure we have an array of args and not undefined
            if (!Array.isArray(executeArgs) || executeArgs.length < (func.inputs?.length ?? 0)) {
                throw new Error("Arguments are not ready for execution");
            }

            // execution log removed

            const tx = await writeContractAsync({
                address: contractAddress,
                abi: [func],
                functionName: func.name,
                args: executeArgs,
            });

            // `writeContractAsync` may return a tx hash string or a tx object.
            // Normalize to string for `txHash` state.
            let resolvedHash: string | null = null;
            if (!tx) resolvedHash = null;
            else if (typeof tx === "string") resolvedHash = tx;
            else resolvedHash = String(tx);

            setTxHash(resolvedHash);
        } catch (error) {
            console.error("Error executing contract function:", error);
            toast.error("Error executing contract function. See console for details.", {
                description: (error as Error).message?.slice(0, 100) || error?.toString().slice(0, 100) || undefined,
            });
        } finally {
            setIsExecuting(false);
        }
    };

    // 
    const handleBuildAndEncrypt = async () => {
        setIsEncrypting(true);
        // delay 100 ms to allow button state update
        await new Promise((resolve) => setTimeout(resolve, 100));

        try {
            const finalArgs = await prepareFinalArgs();
            // Set final args ke state
            for (let i = 0; i < finalArgs.length; i++) {
                handleArgsChange(i, finalArgs[i]);
            }
            setActiveTab("built");
        } catch (error) {
            console.error("Error building and encrypting arguments:", error);
            toast.error("Error building and encrypting arguments. See console for details.", {
                // trim error message to max 100 characters
                description: (error as Error).message?.slice(0, 100) || error?.toString().slice(0, 100) || undefined,
            });
        } finally {
            setIsEncrypting(false);
        }
    };



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
    return (
        <div className="space-y-2">
            {/* Fungsi tanpa input, hanya tampilkan tombol eksekusi */}
            {inputsLen === 0 ? (
                <div className="flex justify-start items-center gap-2">
                    <Button
                        size="sm"
                        disabled={isExecuting}
                        onClick={handleExecution}
                    >
                        {isExecuting ? "Executing..." : "Execute"}
                    </Button>
                    <h4 className="text-fg-muted italic">No inputs required for this function.</h4>
                </div>

                // Fungsi dengan input, tapi tidak ada yang terenkripsi, tampilkan form biasa
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
                            disabled={!isPrepared || isExecuting}
                            onClick={handleExecution}
                        >
                            {isExecuting ? "Executing..." : "Execute"}
                        </Button>
                    </div>
                </>
            ) : (
                // Fungsi dengan encrypted input - perlu tab untuk input dan built arguments
                <>
                    {/* Tab untuk beralih antara input form dan built arguments (menggunakan komponen Tabs) */}
                    <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "input" | "built")}>
                        <div className="border border-border rounded-md overflow-hidden">
                            <TabsList className="flex-1 flex">
                                <TabsTrigger value="input" className={`flex-1 px-3 py-2 text-xs font-medium`}>Input</TabsTrigger>
                                <TabsTrigger value="built" className={`flex-1 px-3 py-2 text-xs font-medium`}>Built Arguments {args.some((arg) => arg !== null) && "✓"}</TabsTrigger>
                            </TabsList>

                            <div className="p-3 bg-secondary/10">
                                <TabsContent value="input">
                                    <div className="space-y-2">
                                        {func.inputs?.map((input, index) => {
                                            if (input.name === "inputProof") return null;
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
                                </TabsContent>

                                <TabsContent value="built">
                                    <div className="space-y-2">
                                        {args.some((arg) => arg !== null) ? (
                                            <>
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
                                </TabsContent>
                            </div>
                        </div>
                    </Tabs>

                    <div className="flex justify-start gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={!isPrepared || isEncrypting || args.some((arg) => arg !== null && arg !== undefined)}
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
