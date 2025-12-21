import type { AbiFunction } from "viem";
import { useReadContract } from "wagmi";
import { Button } from "./ui/button";
import { useMemo, useState } from "react";
import { parseContractReadResult, type ParserOptions } from "@/lib/resultParser";

interface ExecuteReadFunctionProps {
    func: AbiFunction;
    contractAddress: `0x${string}`;
}


type ReadResultParserProps = {
    data: unknown;
    title?: string;
    options?: ParserOptions;
};

export function ExecuteReadFunction({ func, contractAddress }: ExecuteReadFunctionProps) {
    const [fetched, setFetched] = useState<boolean>(false);
    const { data, isLoading, isError, refetch } = useReadContract({
        address: contractAddress,
        abi: [func],
        functionName: func.name,
        args: [],
        query: {
            enabled: fetched,
        },
    });

    const handleFetch = () => {
        if (!fetched) {
            setFetched(true);
        } else {
            refetch();
        }
    }

    return (
        <div className="space-y-2">
            {/* Read function UI can be implemented here */}
            {isLoading ? (
                <p>Loading...</p>
            ) : isError ? (
                <p>Error occurred while fetching data.</p>
            ) : (
                <ReadResultParser data={data} options={{
                    shortenHex: false
                }} />
            )}
            <Button size="sm" onClick={handleFetch}>
                {fetched ? "Refetch" : "Fetch"}
            </Button>
        </div>
    );
}


function ReadResultParser({ data, title = "Result", options }: ReadResultParserProps) {
    const parsed = useMemo(() => parseContractReadResult(data, options), [data, options]);
    console.log(parsed)

    return (
        <div className="rounded-lg border border-border bg-secondary/30">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <div className="text-sm font-semibold">{title}</div>
                <div className="text-xs text-muted-foreground">shape: {parsed.shape}</div>
            </div>

            <pre className="p-3 overflow-x-auto text-xs leading-relaxed">
                {parsed.normalized as string}
            </pre>
        </div>
    );
}
