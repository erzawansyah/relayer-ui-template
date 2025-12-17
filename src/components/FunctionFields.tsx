import { useState } from "react";

/* =========================================================
 * Shared types
 * ========================================================= */

export type EncryptedBundle = {
    ciphertext: string;
    proof: string;
};

export type Encryptor = (args: {
    encryptedType: string;
    clearValue: unknown;
}) => Promise<EncryptedBundle>;

export type Decryptor = (args: {
    encryptedType: string;
    ciphertext: string;
}) => Promise<string>;

interface BaseFieldProps<T> {
    label: string;
    name: string;
    value: T;
    onChange: (v: T) => void;
    placeholder?: string;
    helperText?: string;
}

/* =========================================================
 * Plain fields
 * ========================================================= */

export function NumberField(props: BaseFieldProps<string> & { solidityType?: string }) {
    return (
        <div>
            <label className="text-xs text-fg-muted">{props.label}</label>
            <input
                className="w-full px-2 py-1 border rounded bg-surface"
                value={props.value}
                placeholder={props.placeholder}
                onChange={(e) => props.onChange(e.target.value)}
            />
            {props.helperText && <div className="text-xs text-fg-muted">{props.helperText}</div>}
        </div>
    );
}

export function BoolField(props: BaseFieldProps<boolean>) {
    return (
        <label className="flex items-center gap-2 text-sm">
            <input
                type="checkbox"
                checked={props.value}
                onChange={(e) => props.onChange(e.target.checked)}
            />
            {props.label}
        </label>
    );
}

export function AddressField(props: BaseFieldProps<string>) {
    return (
        <div>
            <label className="text-xs text-fg-muted">{props.label}</label>
            <input
                className="w-full px-2 py-1 border rounded bg-surface font-mono"
                value={props.value}
                placeholder={props.placeholder ?? "0x..."}
                onChange={(e) => props.onChange(e.target.value)}
            />
        </div>
    );
}

export function TextField(props: BaseFieldProps<string>) {
    return (
        <div>
            <label className="text-xs text-fg-muted">{props.label}</label>
            <input
                className="w-full px-2 py-1 border rounded bg-surface"
                value={props.value}
                placeholder={props.placeholder}
                onChange={(e) => props.onChange(e.target.value)}
            />
        </div>
    );
}

export function BytesField(props: BaseFieldProps<string>) {
    return (
        <div>
            <label className="text-xs text-fg-muted">{props.label}</label>
            <input
                className="w-full px-2 py-1 border rounded bg-surface font-mono"
                value={props.value}
                placeholder={props.placeholder ?? "0x..."}
                onChange={(e) => props.onChange(e.target.value)}
            />
        </div>
    );
}

/* =========================================================
 * Encrypted input (INTI)
 * ========================================================= */

export function EncryptedInputField(props: {
    label: string;
    name: string;
    encryptedType: string;
    value: EncryptedBundle | null;
    onChange: (v: EncryptedBundle | null) => void;
    encryptor: Encryptor;
    helperText?: string;
}) {
    const [clearValue, setClearValue] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleEncrypt() {
        setError("");
        try {
            setLoading(true);
            const result = await props.encryptor({
                encryptedType: props.encryptedType,
                clearValue,
            });
            props.onChange(result);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Encrypt failed");
            props.onChange(null);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="border border-surface-2 rounded p-2">
            <div className="text-xs text-fg-muted mb-1">
                {props.label} ({props.encryptedType})
            </div>

            <input
                className="w-full px-2 py-1 border rounded bg-surface mb-2"
                placeholder="Clear value"
                value={clearValue}
                onChange={(e) => setClearValue(e.target.value)}
            />

            <button
                type="button"
                onClick={handleEncrypt}
                disabled={loading}
                className="px-2 py-1 text-xs bg-primary text-white rounded"
            >
                {loading ? "Encrypting..." : "Encrypt"}
            </button>

            {props.value && (
                <div className="mt-2 text-xs font-mono text-fg-muted truncate">
                    ciphertext: {props.value.ciphertext}
                </div>
            )}

            {error && <div className="text-xs text-red-400 mt-1">{error}</div>}
            {props.helperText && <div className="text-xs text-fg-muted">{props.helperText}</div>}
        </div>
    );
}

/* =========================================================
 * Proof field (bytes, read-only by default)
 * ========================================================= */

export function ProofField(props: BaseFieldProps<string> & { mode?: "readonly" | "editable" }) {
    const readOnly = props.mode !== "editable";

    return (
        <div>
            <label className="text-xs text-fg-muted">{props.label}</label>
            <input
                className="w-full px-2 py-1 border rounded bg-surface font-mono"
                value={props.value}
                readOnly={readOnly}
                placeholder="0x..."
                onChange={(e) => props.onChange(e.target.value)}
            />
        </div>
    );
}

/* =========================================================
 * Encrypted output viewer
 * ========================================================= */

export function EncryptedOutputViewer(props: {
    label: string;
    encryptedType: string;
    ciphertext: string;
    decryptor: Decryptor;
    helperText?: string;
}) {
    const [clear, setClear] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleDecrypt() {
        setError("");
        try {
            setLoading(true);
            const result = await props.decryptor({
                encryptedType: props.encryptedType,
                ciphertext: props.ciphertext,
            });
            setClear(result);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Decrypt failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="border border-surface-2 rounded p-2">
            <div className="text-xs text-fg-muted">{props.label}</div>
            <div className="text-xs font-mono truncate mb-2">{props.ciphertext}</div>

            <button
                type="button"
                onClick={handleDecrypt}
                disabled={loading}
                className="px-2 py-1 text-xs bg-secondary text-white rounded"
            >
                {loading ? "Decrypting..." : "Decrypt"}
            </button>

            {clear && (
                <div className="mt-2 text-sm font-mono text-fg">
                    {clear}
                </div>
            )}

            {error && <div className="text-xs text-red-400 mt-1">{error}</div>}
            {props.helperText && <div className="text-xs text-fg-muted">{props.helperText}</div>}
        </div>
    );
}
