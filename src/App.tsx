import { useState } from 'react'
import { WalletConnect } from './components/WalletConnect'
import { ManifestLoader } from './components/ManifestLoader'
import { ContractInteraction } from './components/ContractInteraction'
import type { ContractManifest } from './types/manifest'

function App() {
  const [manifest, setManifest] = useState<ContractManifest | null>(null)

  return (
    <div className='min-h-screen w-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white p-4'>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Smart Contract Tester</h1>
          <p className="text-gray-400">Test and interact with deployed smart contracts</p>
        </div>

        {/* Wallet Connection */}
        <div className="mb-6">
          <WalletConnect />
        </div>

        {/* Main Content */}
        {!manifest ? (
          <ManifestLoader onLoad={setManifest} />
        ) : (
          <ContractInteraction
            manifest={manifest}
            onReset={() => setManifest(null)}
          />
        )}
      </div>
    </div>
  )
}

export default App
