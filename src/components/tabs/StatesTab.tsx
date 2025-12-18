import type { ContractStateVariableType } from "../../lib/types/ui";

interface StatesTabProps {
    states: ContractStateVariableType[];
}

export default function StatesTab({ states }: StatesTabProps) {
    if (!states || states.length === 0) {
        return (
            <div className="text-center py-8 text-fg-muted text-sm">
                No state variables
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {states.map((state) => (
                <div
                    key={state.name}
                    className="p-3 rounded-lg bg-surface-2/50 hover:bg-surface-2 transition-colors border border-surface-2"
                >
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="font-medium text-sm">{state.name}</span>
                        </div>
                        <span className="text-xs text-fg-muted font-mono bg-surface px-2 py-1 rounded">
                            {state.type}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
