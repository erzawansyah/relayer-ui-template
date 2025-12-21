import { useFhevmContext } from "../lib/fhevm/useFhevmContext";
import { BanIcon, Globe, Loader2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { useMemo } from "react";

export default function FhevmStatus() {
    const { status } = useFhevmContext();

    const variantByStatus = useMemo(() => {
        switch (status) {
            case "idle":
                return "ghost";
            case "loading":
                return "secondary";
            case "ready":
                return "default";
            case "error":
                return "destructive";
            default:
                return "secondary";
        }
    }, [status]);


    return (
        <Badge variant={variantByStatus} className="flex items-center px-2 py-3 text-sm">
            {status === "idle" && (
                <>
                    <Globe className="mr-1 h-4 w-4" />
                    <span>FHEVM Idle</span>
                </>
            )}
            {status === "loading" && (
                <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    <span>FHEVM Loading</span>
                </>
            )}
            {status === "ready" && (
                <>
                    <Globe className="mr-1 h-4 w-4" />
                    <span>FHEVM Ready</span>
                </>
            )}
            {status === "error" && (
                <>
                    <BanIcon className="mr-1 h-4 w-4" />
                    <span>FHEVM Error</span>
                </>
            )}
        </Badge>
    )
}
