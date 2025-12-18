import type { ContractFunctionType } from "../../lib/types/ui";
import FunctionItem from "../FunctionItem";

interface FunctionsTabProps {
    functions: ContractFunctionType[];
    type: 'read' | 'write';
}

export default function FunctionsTab({ functions, type }: FunctionsTabProps) {
    const { emptyMessage } = type === 'read'
        ? { emptyMessage: 'No read functions available for this contract.' }
        : { emptyMessage: 'No write functions available for this contract.' };

    if (!functions || functions.length === 0) {
        return (
            <div className="text-center py-8 text-fg-muted text-sm">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {functions.map((func) => <FunctionItem key={func.name} func={func} />)}
        </div>
    );
}


