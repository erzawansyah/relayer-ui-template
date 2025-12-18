import { useState } from "react";
import type { ContractFunctionType } from "../lib/types/ui";
import ConditionalField, { type FieldValue } from "./fields/ConditionalField";

export default function FunctionItem({ func }: { func: ContractFunctionType }) {
    const [expanded, setExpanded] = useState(false);


    return (
        <div className="p-3 rounded-lg bg-surface-2 hover:bg-surface-2 transition-colors border border-surface-2">
            <div className="flex justify-between items-center gap-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="font-medium text-sm">{func.name}</span>
                        <span className="text-xs text-fg-muted font-mono bg-surface px-2 py-1 rounded">
                            {func.type}
                        </span>
                    </div>
                    {func.description && (
                        <p className="text-xs text-fg-muted ml-4">{func.description}</p>
                    )}
                </div>

                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs border-none bg-secondary text-surface font-medium py-2 px-8 rounded-lg hover:bg-secondary/90 transition-colors hover:shadow-md"
                >
                    {expanded ? "Close" : "Open"}
                </button>
            </div>
            {expanded && <ExpandedSection inputs={func.inputs} config={func.config} />}
        </div>
    );
}

function ExpandedSection({ inputs, config }: { inputs: ContractFunctionType['inputs'], config: ContractFunctionType['config'] }) {
    const [executed, setExecuted] = useState(false);
    const [values, setValues] = useState<Record<string, FieldValue>>(() =>
        inputs.reduce((acc, input) => {
            acc[input.name] = "";
            return acc;
        }, {} as Record<string, FieldValue>)
    );

    const handleExecution = async () => {
        setExecuted(true);
        // delay simulation of function execution
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Placeholder for function execution logic (can use `values` here)
        alert("Function execution logic goes here.");
        setExecuted(false);
    }

    const handleChange = (name: string, value: FieldValue) => {
        setValues(prev => ({ ...prev, [name]: value }));
    }

    if (inputs.length === 0) {
        return (

            <button
                onClick={async (): Promise<void> => await handleExecution()}
                className="mt-3 w-full border border-primary bg-primary text-surface font-medium py-2 px-8 rounded-lg hover:bg-primary/90 transition-colors hover:shadow-md"
                disabled={executed}
            >
                {executed ? "Executing..." : "Execute"}
            </button>
        )
    }



    return (
        <div className="mt-3 border border-surface bg-surface p-3 space-y-2 rounded-lg">
            <div>
                <span className="text-xs text-fg-muted">Inputs:</span>
                <ul className="list-disc list-inside mt-1">
                    {inputs.map((input, index) => (
                        <ConditionalField
                            key={index}
                            input={input}
                            config={config}
                            value={values[input.name] || ""}
                            onChange={(v) => handleChange(input.name, v)}
                        />
                    ))}
                </ul>
                <button
                    onClick={handleExecution}
                    disabled={executed}
                    className="mt-3 w-full border border-primary bg-primary text-surface font-medium py-2 px-8 rounded-lg hover:bg-primary/90 transition-colors hover:shadow-md"
                >
                    {executed ? "Executing..." : "Execute"}
                </button>
            </div>
        </div>
    )
}
