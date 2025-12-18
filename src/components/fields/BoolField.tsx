interface BoolFieldProps {
    value: boolean;
    onChange: (value: boolean) => void;
    placeholder?: string;
}

export default function BoolField({ value, onChange }: BoolFieldProps) {
    return (
        <label className="flex items-center gap-2 cursor-pointer">
            <input
                type="checkbox"
                checked={value || false}
                onChange={(e) => onChange(e.target.checked)}
                className="w-4 h-4"
            />
            <span className="text-sm">Enable</span>
        </label>
    );
}
