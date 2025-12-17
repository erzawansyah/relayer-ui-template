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
        <div className="mb-8 rounded-lg border border-surface-2 p-6 bg-surface">
            <h2 className="text-2xl font-bold mb-2">{metadata.name}</h2>
            <p className="text-sm text-fg-muted mb-4">
                {metadata.description}
            </p>
            {
                address && (
                    <div className="mb-4">
                        <span className="font-mono text-xs text-fg-muted">Contract Address:</span>
                        <div className="font-mono text-sm text-fg">{address}</div>
                    </div>
                )
            }
            <div>
                <div className="font-mono text-xs text-fg-muted mb-1">Details:</div>
                <ul className="list-disc list-inside text-sm text-fg">
                    <li><strong>Contract Name:</strong> {metadata.contract_name}</li>
                    <li><strong>Version:</strong> {metadata.version}</li>
                    <li><strong>FHEVM Version:</strong> {metadata.fhevm_version}</li>
                    <li><strong>Category:</strong> {metadata.category}</li>
                    <li><strong>Tags:</strong> {metadata.tags.join(", ")}</li>
                    <li><strong>Concepts:</strong> {metadata.concepts.join(", ")}</li>
                    <li><strong>Has UI:</strong> {metadata.has_ui ? "Yes" : "No"}</li>
                    <li><strong>Authors:</strong> {metadata.authors.map(author => author.name).join(", ")}</li>
                </ul>
            </div>
        </div>
    )
}

