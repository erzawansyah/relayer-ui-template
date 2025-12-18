interface BytesFieldProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function BytesField({ value, onChange, placeholder }: BytesFieldProps) {
    return (
        <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "0x..."}
            className="w-full px-3 py-2 border border-surface-2 rounded bg-surface text-sm font-mono"
        />
    );
}
