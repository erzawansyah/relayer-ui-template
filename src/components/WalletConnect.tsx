import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4 p-4 bg-blue-900 rounded-lg">
        <div className="text-sm">
          <div className="text-gray-400">Connected:</div>
          <div className="font-mono">{address.slice(0, 6)}...{address.slice(-4)}</div>
        </div>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 bg-blue-900 rounded-lg">
      <div className="text-lg font-semibold mb-3">Connect Wallet</div>
      <div className="flex flex-col gap-2">
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => connect({ connector })}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Connect with {connector.name}
          </button>
        ))}
      </div>
    </div>
  )
}
