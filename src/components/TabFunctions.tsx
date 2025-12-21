// FunctionsTab.tsx
import type { AbiFunction } from "viem";
import { useContractContext } from "@/hooks/useContractContext";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemFooter,
    ItemTitle,
} from "./ui/item";
import { Button } from "./ui/button";
import { Minus, Plus } from "lucide-react";
import { Badge } from "./ui/badge";
import { useMemo, useState } from "react";
import { ExecuteReadFunction } from "./ExecuteReadFunction";
import { ExecuteWriteFunction } from "./ExecuteWriteFunction";

interface FunctionsTabProps {
    functions: AbiFunction[];
    type: "read" | "write";
}

function getFuncKey(func: AbiFunction, type: "read" | "write"): string {
    const inputs = func.inputs?.map((i) => i.type).join(",") ?? "";
    return `${type}:${func.name}(${inputs})`;
}

function getFuncLabel(func: AbiFunction): string {
    const inputs = func.inputs?.map((i) => i.internalType ?? i.type).join(", ") ?? "";
    const outputs = func.outputs.length === 0 ? "void" : func.outputs?.map((o) => o.internalType ?? o.type).join(", ");
    return `(${inputs}) → ${outputs}`;
}

export function FunctionsTab({ functions, type }: FunctionsTabProps) {
    const [expandedFunctions, setExpandedFunctions] = useState<Record<string, boolean>>(
        {}
    );

    const onToggleExpand = (funcKey: string) => {
        setExpandedFunctions((prev) => ({
            ...prev,
            [funcKey]: !prev[funcKey],
        }));
    };

    const { data } = useContractContext();

    const contractAddress = useMemo(() => {
        return (data?.address as `0x${string}`) ?? ("0x" as `0x${string}`);
    }, [data?.address]);

    return (
        <div className="space-y-2">
            {functions.map((func, index) => {
                const funcKey = getFuncKey(func, type);
                const expanded = !!expandedFunctions[funcKey];

                return (
                    <Item key={`${funcKey}-${index}`} variant={"outline"}>
                        <ItemContent>
                            <ItemTitle>
                                {func.name}
                                <Badge variant={"secondary"}>{func.stateMutability}</Badge>
                            </ItemTitle>

                            <ItemDescription>{getFuncLabel(func)}</ItemDescription>
                        </ItemContent>

                        <ItemActions>
                            <Button
                                variant="secondary"
                                size="icon-lg"
                                onClick={() => onToggleExpand(funcKey)}
                            >
                                {expanded ? <Minus /> : <Plus />}
                            </Button>
                        </ItemActions>

                        {expanded && (
                            <ItemFooter>
                                <div className="w-full bg-secondary rounded-lg p-4">
                                    {type === "read" && (
                                        <ExecuteReadFunction
                                            key={funcKey}
                                            func={func}
                                            contractAddress={contractAddress}
                                        />
                                    )}

                                    {type === "write" && (
                                        <ExecuteWriteFunction
                                            key={funcKey}
                                            func={func}
                                            contractAddress={contractAddress}
                                        />
                                    )}
                                </div>
                            </ItemFooter>
                        )}
                    </Item>
                );
            })}
        </div>
    );
}
