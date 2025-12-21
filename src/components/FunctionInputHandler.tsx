import type { SupportedInputInternalType, SupportedInputType } from "../types/functions.d";
import { identifyInputType } from "@/lib/typeValidator";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface FunctionInputHandlerProps {
    name: string;
    rawType: SupportedInputInternalType;
    type: SupportedInputType;
    contractAddress?: `0x${string}`;
    value?: unknown;
    onChange?: (value: unknown) => void;
}

export default function FunctionInputHandler(props: React.PropsWithChildren<FunctionInputHandlerProps>) {
    const { name, rawType, type, value, onChange } = props;
    return (
        <>
            <Label htmlFor={`${name}:${type}`}>
                {name} ({rawType})
            </Label>
            <Input
                id={`${name}:${type}`}
                value={value as string | number | undefined}
                onChange={(e) => {
                    let val: unknown = e.target.value;
                    const identifiedType = identifyInputType(rawType);
                    if (identifiedType?.rawField === "number") {
                        val = Number(val);
                    }

                    onChange?.(val);
                }}
                placeholder={`${rawType}`}
            />
        </>
    )
}
