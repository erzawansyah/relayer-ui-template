import { useEffect, useMemo, useState } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import { Spinner } from "./ui/spinner";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "./ui/button";

interface FunctionTxConfirmationProps {
    txHash: `0x${string}`;
}

export default function FunctionTxConfirmation(props: FunctionTxConfirmationProps) {
    const { txHash } = props;
    const { isSuccess, isError, isLoading } = useWaitForTransactionReceipt({ hash: txHash });
    const [copied, setCopied] = useState(false);
    const [visible, setVisible] = useState(true);
    const [elapsed, setElapsed] = useState(0);

    // Start elapsed timer when pending
    useEffect(() => {
        let t: number | undefined;
        let resetTimeout: number | undefined;
        if (isLoading) {
            // Defer resetting elapsed to avoid calling setState synchronously inside the effect
            resetTimeout = window.setTimeout(() => setElapsed(0), 0);
            t = window.setInterval(() => setElapsed((s) => s + 1), 1000);
        }
        return () => {
            if (resetTimeout) clearTimeout(resetTimeout);
            if (t) clearInterval(t);
        };
    }, [isLoading]);

    // Small helper to copy and toast
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(txHash);
            setCopied(true);
            toast.success("Transaction hash copied");
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error("Failed to copy transaction hash to clipboard:", e);
            toast.error("Failed to copy transaction hash to clipboard.");
        }
    };

    const hide = () => setVisible(false);

    const status = useMemo(() => {
        if (isLoading) return "pending";
        if (isSuccess) return "success";
        if (isError) return "error";
        return "unknown";
    }, [isLoading, isSuccess, isError]);

    if (!visible) return null;

    return (
        <div className="p-3 rounded-md border bg-card shadow-sm w-full" aria-live="polite">
            <div className="flex justify-between items-end gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        {/* Stepper */}
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${status === "pending" ? "bg-secondary/10 animate-pulse" : status === "success" ? "bg-green-100" : status === "error" ? "bg-red-100" : "bg-border"}`}>
                                {status === "pending" ? <Spinner /> : status === "success" ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-600">
                                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : status === "error" ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-600">
                                        <path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground">
                                        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <div className="text-sm font-medium">Transaction</div>
                                <div className="text-xs text-muted-foreground font-mono truncate max-w-sm">{txHash}</div>
                                <div className="text-xs text-muted-foreground">{isLoading ? `${elapsed}s` : ""}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                        <Button onClick={handleCopy} variant={"ghost"}>{copied ? "Copied" : "Copy"}</Button>
                        <Button asChild>
                            <a
                                href={`https://eth-sepolia.blockscout.com/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer" >
                                Explorer
                            </a>
                        </Button>
                    </div>
                    <Button variant="destructive" size="icon-xs" onClick={hide} className="absolute -top-6 -right-1/6 z-30 text-xs p-1 rounded-full border hover:bg-secondary/5">
                        <X className="text-destructive" size={12} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
