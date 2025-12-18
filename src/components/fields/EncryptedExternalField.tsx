import { useState } from "react";
import type { ExternalFheSolidityType } from "../../lib/types/ui";

export interface EncryptedBundle {
    ciphertext: string;
    proof: string;
}

interface EncryptedExternalFieldProps {
    type: ExternalFheSolidityType;
    value: EncryptedBundle | null;
    onChange: (value: EncryptedBundle | null) => void;
    placeholder?: string;
}

export default function EncryptedExternalField({
    type,
    value,
    onChange,
    placeholder
}: EncryptedExternalFieldProps) {
    const [clearValue, setClearValue] = useState("");
    const [isEncrypted, setIsEncrypted] = useState(false);

    const handleEncrypt = () => {
        // TODO: Implement actual encryption using fhevmjs
        onChange({
            ciphertext: clearValue,
            proof: "proof_placeholder"
        });
        setIsEncrypted(true);
    };

    const handleClear = () => {
        setClearValue("");
        onChange(null);
        setIsEncrypted(false);
    };

    return (
        <div className="space-y-2 border border-surface-2 rounded p-3 bg-surface/50">
            <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">🔐 Encrypted Input</span>
                <span className="text-xs text-fg-muted">({type})</span>
            </div>

            <input
                type="text"
                value={clearValue}
                onChange={(e) => setClearValue(e.target.value)}
                placeholder={placeholder || "Enter clear value to encrypt..."}
                disabled={isEncrypted}
                className="w-full px-3 py-2 border border-surface-2 rounded bg-surface text-sm disabled:opacity-50"
            />

            <div className="flex gap-2">
                {!isEncrypted ? (
                    <button
                        type="button"
                        onClick={handleEncrypt}
                        disabled={!clearValue}
                        className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Encrypt
                    </button>
                ) : (
                    <>
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                            ✓ Encrypted
                        </span>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-3 py-1 text-xs font-medium bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            Clear
                        </button>
                    </>
                )}
            </div>

            {isEncrypted && value && (
                <div className="text-xs text-fg-muted font-mono truncate">
                    Ciphertext: {value.ciphertext?.substring(0, 20)}...
                </div>
            )}
        </div>
    );
}
