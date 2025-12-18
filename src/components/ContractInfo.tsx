import { type ContractMetadataType } from "../types/metadata"

interface ContractInfoProps {
    address?: `0x${string}` | string | null,
    metadata?: ContractMetadataType
}

export default function ContractInfo({
    address,
    metadata,
}: ContractInfoProps) {
    if (!metadata) {
        return null
    }

    return (
        <div className="rounded-xl border border-surface-2 bg-surface shadow-sm overflow-hidden">
            {/* Header Section */}
            <div className="bg-linear-to-r from-primary/10 to-primary/5 p-4 border-b border-surface-2">
                <h2 className="text-xl font-bold mb-1">{metadata.name}</h2>
                <p className="text-sm text-fg-muted">{metadata.description}</p>
            </div>

            {/* Content Section */}
            <div className="p-4 space-y-3">
                {address && (
                    <div className="flex items-center gap-2 p-2 bg-surface-2/30 rounded-lg">
                        <span className="text-xs text-fg-muted">Address:</span>
                        <code className="font-mono text-xs text-fg flex-1 truncate">{address}</code>
                    </div>
                )}

                {/* Compact Info Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex flex-col gap-0.5 p-2 bg-surface-2/30 rounded-lg">
                        <span className="text-fg-muted">Version</span>
                        <span className="font-semibold">{metadata.version}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 p-2 bg-surface-2/30 rounded-lg">
                        <span className="text-fg-muted">FHEVM</span>
                        <span className="font-semibold">{metadata.fhevm_version}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 p-2 bg-surface-2/30 rounded-lg">
                        <span className="text-fg-muted">Category</span>
                        <span className="font-semibold capitalize">{metadata.category}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 p-2 bg-surface-2/30 rounded-lg">
                        <span className="text-fg-muted">Contract</span>
                        <span className="font-semibold font-mono">{metadata.contract_name}</span>
                    </div>
                </div>

                {/* Tags & Concepts */}
                <div className="space-y-2">
                    {metadata.tags.length > 0 && (
                        <div>
                            <span className="text-xs text-fg-muted mb-1 block">Tags</span>
                            <div className="flex flex-wrap gap-1">
                                {metadata.tags.map(tag => (
                                    <span key={tag} className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {metadata.concepts.length > 0 && (
                        <div>
                            <span className="text-xs text-fg-muted mb-1 block">Concepts</span>
                            <div className="flex flex-wrap gap-1">
                                {metadata.concepts.map(concept => (
                                    <span key={concept} className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-600 rounded-full">
                                        {concept}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

