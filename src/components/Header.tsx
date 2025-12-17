import { ConnectButton } from "@rainbow-me/rainbowkit"

export default function Header() {
    return (
        <header className="w-full border-b ">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Left */}
                <div className="flex items-center gap-3">
                    <div className="text-sm font-mono text-fg-muted">
                        FHEVM
                    </div>
                    <div className="h-4 w-px bg-neutral-700" />
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
