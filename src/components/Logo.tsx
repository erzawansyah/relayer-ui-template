import { Badge } from '@/components/ui/badge';

interface LogoProps {
    className?: string;
}

export function Logo({ className = '' }: LogoProps) {
    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <Badge className="text-lg font-mono px-2 py-3 font-semibold">
                FHEVM
            </Badge>
            <h1 className="text-lg font-semibold text-foreground">StarterKit</h1>
        </div>
    );
}
