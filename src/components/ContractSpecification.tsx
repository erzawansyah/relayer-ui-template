import { useContractContext } from "@/hooks/useContractContext";
import { AlignJustify, Clock, Plus } from "lucide-react";
import { Badge } from "./ui/badge";


export default function ContractSpecification() {
    const { data } = useContractContext();
    const { metadata, address } = data || {};

    if (!metadata) {
        return <ContractSpecificationSkeleton />;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
                {metadata.contract_file}
                <span className="ml-2 text-sm font-mono text-foreground/70 bg-secondary/50 px-2 py-1 rounded-lg">
                    {address}
                </span>
            </h2>
            <p className="text-foreground/70">{metadata.description}</p>

            {/* Grid wrapper for details specification */}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-linear-to-br from-white/2 to-white/5 rounded-lg border border-border">
                    <div className="flex-none w-10 h-10 rounded-md bg-primary/10 grid place-items-center">
                        <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <dt className="text-xs uppercase text-foreground/60">Version</dt>
                        <dd className="mt-1 font-medium text-foreground">{metadata.version ?? "—"}</dd>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-linear-to-br from-white/2 to-white/5 rounded-lg border border-border">
                    <div className="flex-none w-10 h-10 rounded-md bg-primary/10 grid place-items-center">
                        <Plus className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <dt className="text-xs uppercase text-foreground/60">FHEVM Version</dt>
                        <dd className="mt-1 font-medium text-foreground">{metadata.fhevm_version ?? "—"}</dd>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-linear-to-br from-white/2 to-white/5 rounded-lg border border-border">
                    <div className="flex-none w-10 h-10 rounded-md bg-primary/10 grid place-items-center">
                        <AlignJustify className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <dt className="text-xs uppercase text-foreground/60">Category</dt>
                        <dd className="mt-1 font-medium text-foreground">{metadata.category.toUpperCase() ?? "—"}</dd>
                    </div>
                </div>

                <div className="p-4 bg-linear-to-br from-white/2 to-white/5 rounded-lg border border-border">
                    <dt className="text-xs uppercase text-foreground/60 mb-2">Tags</dt>
                    <dd className="flex flex-wrap gap-2 mt-1">
                        {(metadata.tags && metadata.tags.length > 0)
                            ? metadata.tags.map((tag: string) => (
                                <Badge key={tag} variant={"secondary"}>
                                    {tag}
                                </Badge>
                            ))
                            : <span className="text-sm text-foreground/70">No tags</span>
                        }
                    </dd>
                </div>
            </dl>
        </div>
    );
}


// Skeleton loader component
function ContractSpecificationSkeleton() {
    return (
        <div className="border border-border rounded-lg p-4 space-y-4 bg-secondary/50 animate-pulse">
            <div className="h-8 w-1/3 bg-foreground/10 rounded"></div>
            <div className="h-4 w-2/3 bg-foreground/10 rounded"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-linear-to-br from-white/2 to-white/5 rounded-lg border border-border">
                        <div className="flex-none w-10 h-10 rounded-md bg-foreground/10"></div>
                        <div>
                            <div className="h-3 w-1/4 bg-foreground/10 rounded mb-2"></div>
                            <div className="h-4 w-1/2 bg-foreground/10 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
