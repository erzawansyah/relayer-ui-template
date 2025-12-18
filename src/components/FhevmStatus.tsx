import { useMemo } from "react";
import { useFhevmContext } from "../lib/fhevm/useFhevmContext";
import { BanIcon, Globe, Loader2 } from "lucide-react";

export default function FhevmStatus() {
    const { status } = useFhevmContext();
    const badgeColor = useMemo(() => {
        switch (status) {
            case "ready":
                return "bg-success";
            case "loading":
                return "bg-info";
            case "error":
                return "bg-danger";
            default:
                return "bg-secondary-background";
        }
    }, [status]);

    return (
        <div className="fixed bottom-0 z-50">
            <span className={`inline-flex items-center rounded-md px-3 py-1 m-4 ${badgeColor} text-main-foreground`}>
                {
                    status === "ready" ? <Globe className="mr-1 h-4 w-4" /> :
                        status === "loading" ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> :
                            status === "error" ? <BanIcon className="mr-1 h-4 w-4" /> :
                                null
                }


                FHEVM Testnet
            </span>
        </div>
    )
}
