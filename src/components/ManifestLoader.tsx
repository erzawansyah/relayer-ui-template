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
        <div className="p-4 bg-blue-900 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Load Contract Manifest</h2>
            <div className="mb-3">
                <button
                    onClick={loadExample}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm"
                >
                    Load Example
                </button>
            </div>
            <textarea
                value={manifestText}
                onChange={(e) => setManifestText(e.target.value)}
                placeholder='Paste contract manifest JSON here...'
                className="w-full h-48 p-3 bg-gray-800 text-white rounded border border-gray-600 font-mono text-sm"
            />
            {error && (
                <div className="mt-2 p-2 bg-red-900 text-red-200 rounded text-sm">
                    {error}
                </div>
            )}
            <button
                onClick={handleLoad}
                className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors w-full"
            >
                Load Contract
            </button>
        </div>
    )
}
