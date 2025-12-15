import { useState } from 'react'
import type { ContractManifest } from '../types/manifest'

interface Props {
    onLoad: (manifest: ContractManifest) => void
}

export function ManifestLoader({ onLoad }: Props) {
    const [manifestText, setManifestText] = useState('')
    const [error, setError] = useState('')

    const handleLoad = () => {
        try {
            const parsed = JSON.parse(manifestText)

            // Validate manifest
            if (!parsed.name || !parsed.address || !parsed.abi) {
                throw new Error('Manifest must include name, address, and abi')
            }

            setError('')
            onLoad(parsed as ContractManifest)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid JSON')
        }
    }

    const loadExample = () => {
        const example: ContractManifest = {
            name: "Example Counter",
            address: "0x1234567890123456789012345678901234567890",
            chainId: 11155111,
            description: "A simple counter contract",
            abi: [
                {
                    "name": "count",
                    "type": "function",
                    "stateMutability": "view",
                    "inputs": [],
                    "outputs": [{ "name": "", "type": "uint256" }]
                },
                {
                    "name": "increment",
                    "type": "function",
                    "stateMutability": "nonpayable",
                    "inputs": [],
                    "outputs": []
                },
                {
                    "name": "setCount",
                    "type": "function",
                    "stateMutability": "nonpayable",
                    "inputs": [{ "name": "newCount", "type": "uint256" }],
                    "outputs": []
                }
            ]
        }
        setManifestText(JSON.stringify(example, null, 2))
    }

    return (
        <div className="p-3 bg-blue-900 rounded-lg">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Load Contract Manifest</h2>
                <button
                    onClick={loadExample}
                    className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs"
                >
                    Load Example
                </button>
            </div>
            <textarea
                value={manifestText}
                onChange={(e) => setManifestText(e.target.value)}
                placeholder='Paste contract manifest JSON here...'
                className="w-full h-32 p-2 bg-gray-800 text-white rounded border border-gray-600 font-mono text-xs"
            />
            {error && (
                <div className="mt-2 p-2 bg-red-900 text-red-200 rounded text-xs">
                    {error}
                </div>
            )}
            <button
                onClick={handleLoad}
                className="mt-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded transition-colors w-full text-sm font-medium"
            >
                Load Contract
            </button>
        </div>
    )
}
