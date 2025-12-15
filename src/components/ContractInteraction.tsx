import type { ContractManifest, ContractFunction } from '../types/manifest'
import { ContractFunctionRenderer } from './ContractFunctionRenderer'

interface Props {
  manifest: ContractManifest
  onReset: () => void
}

export function ContractInteraction({ manifest, onReset }: Props) {
  const functions = (manifest.abi as ContractFunction[]).filter(item => item.type === 'function')
  const readFunctions = functions.filter(f => 
    f.stateMutability === 'view' || f.stateMutability === 'pure'
  )
  const writeFunctions = functions.filter(f => 
    f.stateMutability !== 'view' && f.stateMutability !== 'pure'
  )

  return (
    <div className="w-full max-w-4xl">
      {/* Contract Info */}
      <div className="mb-4 p-4 bg-blue-900 rounded-lg">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{manifest.name}</h2>
            {manifest.description && (
              <p className="text-gray-300 text-sm mb-2">{manifest.description}</p>
            )}
            <div className="text-sm">
              <div className="text-gray-400">Contract Address:</div>
              <div className="font-mono">{manifest.address}</div>
            </div>
            {manifest.chainId && (
              <div className="text-sm mt-1">
                <span className="text-gray-400">Chain ID:</span> {manifest.chainId}
              </div>
            )}
          </div>
          <button
            onClick={onReset}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm"
          >
            Load Different Contract
          </button>
        </div>
      </div>

      {/* Read Functions */}
      {readFunctions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 px-2">Read Functions</h3>
          <div className="space-y-3">
            {readFunctions.map((func, idx) => (
              <ContractFunctionRenderer
                key={`read-${idx}`}
                contractAddress={manifest.address}
                contractFunction={func}
                abi={manifest.abi}
              />
            ))}
          </div>
        </div>
      )}

      {/* Write Functions */}
      {writeFunctions.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-3 px-2">Write Functions</h3>
          <div className="space-y-3">
            {writeFunctions.map((func, idx) => (
              <ContractFunctionRenderer
                key={`write-${idx}`}
                contractAddress={manifest.address}
                contractFunction={func}
                abi={manifest.abi}
              />
            ))}
          </div>
        </div>
      )}

      {functions.length === 0 && (
        <div className="p-8 text-center text-gray-400">
          No functions found in contract ABI
        </div>
      )}
    </div>
  )
}
