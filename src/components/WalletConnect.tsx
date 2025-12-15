import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function WalletConnect() {
    const { address, isConnected } = useAccount()
    const { connect, connectors } = useConnect()
    const { disconnect } = useDisconnect()

    if (isConnected && address) {
        return (
            <div className="flex items-center justify-between p-2.5 bg-blue-900 rounded-lg">
                <div className="text-xs">
                    <span className="text-gray-400">Wallet:</span>
                    <span className="font-mono ml-1">{address.slice(0, 6)}...{address.slice(-4)}</span>
                </div>
                <button
                    onClick={() => disconnect()}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
                >
                    Disconnect
                </button>
            </div>
        )
    }

    return (
        <div className="p-2.5 bg-blue-900 rounded-lg">
            <div className="text-sm font-semibold mb-2">Connect Wallet</div>
            <div className="flex gap-2">
                {connectors.map((connector) => (
                    <button
                        key={connector.id}
                        onClick={() => connect({ connector })}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                    >
                        {connector.name}
                    </button>
                ))}
            </div>
        </div>
    )
}
