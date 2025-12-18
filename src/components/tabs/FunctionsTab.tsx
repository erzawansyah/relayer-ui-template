import type { ContractFunctionType } from "../../types/ui";

interface FunctionsTabProps {
    functions: ContractFunctionType[];
    type: 'read' | 'write';
}

export default function FunctionsTab({ functions, type }: FunctionsTabProps) {
    const config = {
        read: {
            color: 'bg-green-500',
            label: 'read',
            emptyMessage: 'No read functions',
        },
        write: {
            color: 'bg-orange-500',
            label: 'write',
            emptyMessage: 'No write functions',
        },
    };

    const { color, label, emptyMessage } = config[type];

    if (!functions || functions.length === 0) {
        return (
            <div className="text-center py-8 text-fg-muted text-sm">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {functions.map((func) => (
                <div
                    key={func.name}
                    className="p-3 rounded-lg bg-surface-2/50 hover:bg-surface-2 transition-colors border border-surface-2"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${color}`}></span>
                            <span className="font-medium text-sm">{func.name}</span>
                        </div>
                        <span className="text-xs text-fg-muted font-mono bg-surface px-2 py-1 rounded">
                            {label}
                        </span>
                    </div>
                    {func.description && (
                        <p className="text-xs text-fg-muted mt-1 ml-4">{func.description}</p>
                    )}
                </div>
            ))}
        </div>
    );
}
