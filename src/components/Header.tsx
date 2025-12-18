import { ConnectButton } from "@rainbow-me/rainbowkit"

export default function Header() {
    return (
        <header className="w-full border-b border-surface-2 backdrop-blur-sm bg-surface/80">
            <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
                {/* Left */}
                <div className="flex items-center gap-2">
                    <div className="text-xs font-mono text-fg-muted bg-primary/10 px-2 py-1 rounded">
                        FHEVM
                    </div>
                    <h1 className="text-sm font-semibold text-fg">
                        StarterKit
                    </h1>
                </div>

                {/* Right */}
                <div className="flex items-center">
                    <ConnectButton
                        accountStatus="address"
                        chainStatus="icon"
                        showBalance={false}
                    />
                </div>
            </div>
        </header>
    )
}
