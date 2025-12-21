// FunctionFinalArgument.tsx
import { isEncryptedInputType } from "@/lib/typeValidator";

interface FunctionFinalArgumentProps {
    name: string;
    type: string;
    internalType?: string;
    value: unknown;
}

/**
 * Komponen untuk menampilkan argumen final yang siap dieksekusi ke kontrak.
 * Menampilkan nama, tipe, badge ENCRYPTED jika applicable, dan nilai argumen.
 */
export default function FunctionFinalArgument(props: FunctionFinalArgumentProps) {
    const { name, type, internalType, value } = props;

    // Cek apakah argumen ini terenkripsi
    const isEncrypted = internalType && isEncryptedInputType(internalType);

    return (
        <div className="text-xs border border-border/50 rounded p-2 space-y-1 bg-background/50">
            <div className="flex items-center gap-2">
                <span className="font-medium">{name}</span>
                <span className="text-muted-foreground">({type})</span>
                {isEncrypted && (
                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-medium">
                        ENCRYPTED
                    </span>
                )}
            </div>
            <div className="font-mono text-[11px] break-all opacity-80">
                {String(value)}
            </div>
        </div>
    );
}
