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
            <div className="mb-3 p-3 bg-blue-900 rounded-lg">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold mb-1">{manifest.name}</h2>
                        {manifest.description && (
                            <p className="text-gray-300 text-xs mb-1">{manifest.description}</p>
                        )}
                        <div className="text-xs">
                            <span className="text-gray-400">Address:</span>
                            <div className="font-mono truncate">{manifest.address}</div>
                        </div>
                        {manifest.chainId && (
                            <div className="text-xs">
                                <span className="text-gray-400">Chain:</span> {manifest.chainId}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onReset}
                        className="ml-2 px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs whitespace-nowrap"
                    >
                        Change
                    </button>
                </div>
            </div>

            {/* Read Functions */}
            {readFunctions.length > 0 && (
                <div className="mb-4">
                    <h3 className="text-base font-semibold mb-2 px-1">Read Functions</h3>
                    <div className="space-y-2">
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
                    <h3 className="text-base font-semibold mb-2 px-1">Write Functions</h3>
                    <div className="space-y-2">
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
