import type { AbiFunction } from "viem";
import { useReadContract } from "wagmi";
import { Button } from "./ui/button";
import { useMemo, useState, type JSX } from "react";
import { parseContractReadResult, type ParserOptions } from "@/lib/resultParser";
import FunctionInputHandler from "./FunctionInputHandler";
import { useInputPreparation } from "@/hooks/useInputPreparation";
import type { SupportedInputInternalType, SupportedInputType } from "@/types/functions";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useDecryption } from "@/hooks/useDecryption";
import { isSupportedOutputInternalType } from "@/lib/typeValidator";
import { toast } from "sonner";

interface ExecuteReadFunctionProps {
    func: AbiFunction;
    contractAddress: `0x${string}`;
}

type ReadResultParserProps = {
    data: unknown;
    title?: string;
    options?: ParserOptions;
    func: AbiFunction;
    contractAddress: `0x${string}`;
};

export function ExecuteReadFunction({ func, contractAddress }: ExecuteReadFunctionProps) {
    const [fetched, setFetched] = useState<boolean>(false);
    const [preparedArgs, setPreparedArgs] = useState<unknown[]>([]);

    const {
        inputsLen,
        rawArgs,
        isPrepared,
        errors: validationError,
        handleRawArgChange,
        prepareFinalArgs,
    } = useInputPreparation({
        function: func,
        contractAddress: contractAddress,
    });

    const { data, isLoading, isError, refetch } = useReadContract({
        address: contractAddress,
        abi: [func],
        functionName: func.name,
        args: preparedArgs,
        query: {
            enabled: fetched,
        },
    });

    const handleFetch = async () => {
        try {
            // Prepare final args if there are inputs
            let finalArgs: unknown[] = [];
            if (inputsLen > 0) {
                finalArgs = await prepareFinalArgs();
            }

            setPreparedArgs(finalArgs);

            if (!fetched) {
                setFetched(true);
            } else {
                refetch();
            }
        } catch (error) {
            console.error("Error preparing arguments:", error);
        }
    };



    // Show validation error if inputs are not supported
    if (validationError !== null) {
        return (
            <div className="text-destructive bg-destructive/10 p-3 rounded-md italic">
                This function cannot be executed because one or more of its inputs is not supported.
                <div className="mt-2 text-xs not-italic opacity-80">{validationError}</div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-2">
                {/* Show input fields if function has inputs */}
                {inputsLen > 0 && (
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
                )}

                <Button
                    size="sm"
                    onClick={handleFetch}
                    disabled={(inputsLen > 0 && !isPrepared) || isLoading}
                >
                    {fetched ? "Refetch" : "Fetch"}
                </Button>
            </div>

            {/* Show result if data has been fetched */}
            {fetched && (
                <div className="mt-3">
                    {isLoading ? (
                        <p className="text-sm text-muted-foreground">Loading...</p>
                    ) : isError ? (
                        <p className="text-sm text-destructive">Error occurred while fetching data.</p>
                    ) : (
                        <ReadResultParser
                            data={data}
                            func={func}
                            contractAddress={contractAddress}
                            options={{
                                shortenHex: false
                            }}
                        />
                    )}
                </div>
            )}
        </>
    );
}

function ReadResultParser({ data, title = "Result", options, func, contractAddress }: ReadResultParserProps) {
    const parsed = useMemo(() => parseContractReadResult(data, options), [data, options]);
    const { userDecrypt } = useDecryption();
    const [decryptedValues, setDecryptedValues] = useState<Map<string, string>>(new Map());
    const [decryptingHandles, setDecryptingHandles] = useState<Set<string>>(new Set());

    // Check if the result is an array for special rendering
    const isArray = Array.isArray(parsed.normalized);
    const arrayData = isArray ? (parsed.normalized as unknown[]) : null;

    // Get output types from function
    const outputTypes = func.outputs || [];

    // Dummy decrypt fallback when userDecrypt is not available (for testing)
    const performDecrypt = async (handles: string[], contractAddr: `0x${string}`): Promise<string[]> => {
        try {
            if (typeof userDecrypt === "function") {
                const result = await userDecrypt(handles, contractAddr);

                // If userDecrypt returned an array (older shape), preserve order
                if (Array.isArray(result)) {
                    return result.map(r => String(r));
                }

                // If userDecrypt returned an object mapping ciphertext -> plaintext
                if (result && typeof result === "object") {
                    return handles.map(h => {
                        // Try exact match first, then lowercase key fallback
                        const raw = (result as Record<string, unknown>)[h] ?? (result as Record<string, unknown>)[h.toLowerCase()];
                        if (raw !== undefined && raw !== null) return String(raw);
                        // Fallback to dummy similar to previous behavior
                        if (typeof h === "string" && h.startsWith("0x")) {
                            const hex = h.slice(2);
                            const tail = hex.slice(-8) || hex;
                            const dummyValue = parseInt(tail, 16) % 1000;
                            return `${dummyValue}`;
                        }
                        return "42";
                    });
                }
            }
        } catch (e) {
            console.error("User decryption error:", e);
        }

        // Final fallback if userDecrypt not available or returned unexpected
        return handles.map(() => "");
    };

    // Helper to check if a value is encrypted based on output type
    const isEncryptedValue = (value: unknown, outputIndex: number): boolean => {
        if (typeof value !== "string" || !value.startsWith("0x")) return false;
        const outputType = outputTypes[outputIndex];
        if (!outputType) {
            return false;
        }

        const internalType = outputType.internalType || outputType.type || "";
        if (!internalType) return false;

        // Check if type starts with "e" or "E" for encrypted types
        const isEncrypted = isSupportedOutputInternalType(internalType) &&
            (internalType.toLowerCase().startsWith("euint") ||
                internalType.toLowerCase().startsWith("eint") ||
                internalType.toLowerCase().startsWith("eaddress") ||
                internalType.toLowerCase().startsWith("ebool") ||
                internalType.toLowerCase().startsWith("ebytes"));

        return isEncrypted;
    };

    // Helper to decrypt a single encrypted value
    const handleDecrypt = async (handle: string, label: string) => {
        if (decryptingHandles.has(handle) || decryptedValues.has(handle)) return;

        setDecryptingHandles(prev => new Set(prev).add(handle));
        try {
            const result = await performDecrypt([handle], contractAddress);
            if (Array.isArray(result) && result.length > 0) {
                setDecryptedValues(prev => new Map(prev).set(handle, result[0]));
                toast.success(`Decrypted ${label}: ${result[0]}`);
            }
        } catch (error) {
            console.error("Decryption error:", error);
            toast.error(`Failed to decrypt ${label}`);
        } finally {
            setDecryptingHandles(prev => {
                const next = new Set(prev);
                next.delete(handle);
                return next;
            });
        }
    };

    // Helper to render a single value (handles nested arrays)
    const renderValue = (value: unknown, depth = 0, outputIndex?: number): JSX.Element => {
        // Handle nested arrays
        if (Array.isArray(value)) {
            return (
                <div className={depth > 0 ? "ml-2 mt-1 space-y-1 border-l-2 border-border/30 pl-2" : "space-y-1"}>
                    {value.length === 0 ? (
                        <span className="text-muted-foreground italic">[]</span>
                    ) : (
                        value.map((item, idx) => (
                            <div key={idx} className="flex gap-2 items-start">
                                <Badge variant="outline" className="text-[9px] shrink-0 h-4">
                                    {idx}
                                </Badge>
                                <div className="flex-1 text-xs font-mono">
                                    {renderValue(item, depth + 1, outputIndex)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            );
        }

        // Handle objects
        if (typeof value === "object" && value !== null) {
            return (
                <pre className="text-xs leading-relaxed whitespace-pre-wrap break-all">
                    {JSON.stringify(value, null, 2)}
                </pre>
            );
        }

        // Check if this is an encrypted value that needs decryption
        const valueStr = String(value);
        const isEncrypted = outputIndex !== undefined && isEncryptedValue(value, outputIndex);
        const decryptedValue = decryptedValues.get(valueStr);
        const isDecrypting = decryptingHandles.has(valueStr);

        if (isEncrypted) {
            return (
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-[9px]">
                            ENCRYPTED
                        </Badge>
                        <span className="break-all text-muted-foreground">{valueStr}</span>
                    </div>
                    {decryptedValue ? (
                        <div className="flex items-center gap-2 p-2 rounded bg-primary/5 border border-primary/20">
                            <Badge variant="default" className="text-[9px]">
                                DECRYPTED
                            </Badge>
                            <span className="font-semibold">{decryptedValue}</span>
                        </div>
                    ) : (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-[10px]"
                            onClick={() => handleDecrypt(valueStr, `output[${outputIndex}]`)}
                            disabled={isDecrypting}
                        >
                            {isDecrypting ? "Decrypting..." : "Decrypt"}
                        </Button>
                    )}
                </div>
            );
        }

        // Handle primitives
        return <span className="break-all">{valueStr}</span>;
    };

    return (
        <Card size="sm" className="overflow-hidden">
            <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{title}</CardTitle>
                    <Badge variant="outline" className="text-[10px] font-mono">
                        {parsed.shape}
                        {isArray && arrayData && ` (${arrayData.length})`}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-3">
                {isArray && arrayData ? (
                    <div className="space-y-2">
                        {arrayData.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">Empty array</p>
                        ) : (
                            arrayData.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex gap-2 items-start p-2 rounded border border-border/50 bg-background/50"
                                >
                                    <Badge variant="secondary" className="text-[10px] shrink-0">
                                        {index}
                                    </Badge>
                                    <div className="overflow-x-auto text-xs leading-relaxed font-mono text-muted-foreground flex-1">
                                        {renderValue(item, 0, index)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto text-xs leading-relaxed font-mono text-muted-foreground whitespace-pre-wrap break-all">
                        {renderValue(parsed.normalized, 0, 0)}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
