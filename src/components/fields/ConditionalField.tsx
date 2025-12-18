import type { ContractFunctionType, NativeSolidityType, ExternalFheSolidityType } from "../../lib/types/ui";
import BoolField from "./BoolField";
import AddressField from "./AddressField";
import BytesField from "./BytesField";
import StringField from "./StringField";
import NumberField from "./NumberField";
import EncryptedExternalField, { type EncryptedBundle } from "./EncryptedExternalField";

export type FieldValue = string | boolean | EncryptedBundle | null;

interface ConditionalFieldProps {
    input: ContractFunctionType['inputs'][0];
    config: ContractFunctionType['config'];
    value: FieldValue;
    onChange: (value: FieldValue) => void;
}

export default function ConditionalField({
    input,
    config,
    value,
    onChange,
}: ConditionalFieldProps) {
    const isProofField = config?.proofParam === input.name;
    if (isProofField) {
        return null; // Proof fields are handled separately
    }

    return (
        <div className="space-y-1">
            <label className="text-xs font-medium text-fg-muted">
                {input.name}
                <span className="text-xs ml-1 opacity-60">({input.type})</span>
            </label>
            <FieldByType
                type={input.type}
                value={value}
                onChange={onChange}
                placeholder={input.helper}
            />
            {input.helper && (
                <div className="text-xs text-fg-muted opacity-75">{input.helper}</div>
            )}
        </div>
    );
}

interface FieldByTypeProps {
    type: NativeSolidityType | ExternalFheSolidityType;
    value: FieldValue;
    onChange: (value: FieldValue) => void;
    placeholder?: string;
}

function FieldByType({ type, value, onChange, placeholder }: FieldByTypeProps) {
    // Handle boolean types
    if (type === "bool") {
        return (
            <BoolField
                value={typeof value === "boolean" ? value : false}
                onChange={onChange}
                placeholder={placeholder}
            />
        );
    }

    // Handle address type
    if (type === "address") {
        return (
            <AddressField
                value={typeof value === "string" ? value : ""}
                onChange={onChange}
                placeholder={placeholder}
            />
        );
    }

    // Handle bytes types
    if (type === "bytes" || type === "bytes32") {
        return (
            <BytesField
                value={typeof value === "string" ? value : ""}
                onChange={onChange}
                placeholder={placeholder}
            />
        );
    }

    // Handle string type
    if (type === "string") {
        return (
            <StringField
                value={typeof value === "string" ? value : ""}
                onChange={onChange}
                placeholder={placeholder}
            />
        );
    }

    // Handle all numeric types (uint*, int*)
    if (type.startsWith("uint") || type.startsWith("int")) {
        return (
            <NumberField
                value={typeof value === "string" ? value : ""}
                onChange={onChange}
                placeholder={placeholder}
            />
        );
    }

    // Handle external encrypted types
    if (type.startsWith("external")) {
        return (
            <EncryptedExternalField
                type={type as ExternalFheSolidityType}
                value={value as EncryptedBundle | null}
                onChange={onChange}
                placeholder={placeholder}
            />
        );
    }

    // Default fallback
    return (
        <StringField
            value={typeof value === "string" ? value : ""}
            onChange={onChange}
            placeholder={placeholder || "Enter value..."}
        />
    );
}
