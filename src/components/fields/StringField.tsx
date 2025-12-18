interface StringFieldProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function StringField({ value, onChange, placeholder }: StringFieldProps) {
    return (
        <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Enter text..."}
            className="w-full px-3 py-2 border border-surface-2 rounded bg-surface text-sm"
        />
    );
}
