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
    const identifiedType = identifyInputType(rawType);

    // Fungsi untuk memproses nilai input berdasarkan tipe
    const processInputValue = (inputValue: string): unknown => {
        const trimmedValue = inputValue.trim();

        // Handle array types
        if (identifiedType.arrayDepth > 0) {
            try {
                // Parse as JSON array
                const parsed = JSON.parse(trimmedValue);
                if (Array.isArray(parsed)) {
                    // Process each element based on base type
                    return parsed.map((item) => {
                        if (identifiedType.rawField === "number") {
                            return Number(item);
                        } else if (identifiedType.rawField === "bool") {
                            return item === "true" || item === true;
                        }
                        return item;
                    });
                }
            } catch {
                // If parsing fails, return the raw value
                return trimmedValue;
            }
        }

        // Handle single values based on type
        switch (identifiedType.rawField) {
            case "number": {
                // Handle empty string
                if (trimmedValue === "") return "";
                const numValue = Number(trimmedValue);
                // Validate number
                return isNaN(numValue) ? trimmedValue : numValue;
            }

            case "bool": {
                // Handle boolean values
                if (trimmedValue.toLowerCase() === "true") return true;
                if (trimmedValue.toLowerCase() === "false") return false;
                // Return string if not a valid boolean
                return trimmedValue;
            }

            case "address": {
                // Validate address format (basic validation)
                if (trimmedValue.startsWith("0x") || trimmedValue === "") {
                    return trimmedValue;
                }
                // Add 0x prefix if missing
                return trimmedValue.length > 0 ? `0x${trimmedValue}` : trimmedValue;
            }

            case "bytes": {
                // Validate bytes format
                if (trimmedValue.startsWith("0x") || trimmedValue === "") {
                    return trimmedValue;
                }
                // Add 0x prefix if missing for hex strings
                return trimmedValue.length > 0 ? `0x${trimmedValue}` : trimmedValue;
            }
            case "string":
                return inputValue;
            default:
                // For other types (string, etc.)
                return trimmedValue;
        }
    };

    // Determine input type based on field type
    const getInputType = (): string => {
        if (identifiedType.arrayDepth > 0) return "text";

        switch (identifiedType.rawField) {
            case "number":
                return "number";
            case "bool":
                return "text"; // Could be checkbox in future
            default:
                return "text";
        }
    };

    // Get placeholder text
    const getPlaceholder = (): string => {
        if (identifiedType.arrayDepth > 0) {
            return `[value1, value2, ...] - Array of ${rawType}`;
        }

        switch (identifiedType.rawField) {
            case "number":
                return "Enter a number";
            case "bool":
                return "true or false";
            case "address":
                return "0x...";
            case "bytes":
                return "0x...";
            default:
                return `Enter ${rawType}`;
        }
    };

    return (
        <>
            <Label htmlFor={`${name}:${type}`}>
                {name} ({rawType})
                {identifiedType.isEncrypted && " 🔒"}
            </Label>
            <Input
                id={`${name}:${type}`}
                type={getInputType()}
                value={value as string | number | undefined}
                onChange={(e) => {
                    const processedValue = processInputValue(e.target.value);
                    onChange?.(processedValue);
                }}
                placeholder={getPlaceholder()}
            />
        </>
    )
}
