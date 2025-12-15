import { useState } from 'react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import type { ContractFunction } from '../types/manifest'

interface Props {
    contractAddress: `0x${string}`
    contractFunction: ContractFunction
    abi: unknown[]
}

export function ContractFunctionRenderer({ contractAddress, contractFunction, abi }: Props) {
    const [inputValues, setInputValues] = useState<Record<string, string>>({})
    const [readResult, setReadResult] = useState<unknown>(null)

    const isReadFunction = contractFunction.stateMutability === 'view' || contractFunction.stateMutability === 'pure'

    // For read functions
    const { refetch: refetchRead } = useReadContract({
        address: contractAddress,
        abi: abi,
        functionName: contractFunction.name,
        args: contractFunction.inputs.map(input => {
            const value = inputValues[input.name] || ''
            // Basic type conversion
            if (input.type.includes('uint') || input.type.includes('int')) {
                return value ? BigInt(value) : BigInt(0)
            }
            if (input.type === 'bool') {
                return value === 'true'
            }
            return value
        }),
        query: {
            enabled: false, // Manual trigger only
        }
    })

    // For write functions
    const { writeContract, data: hash, isPending } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    })

    const handleInputChange = (name: string, value: string) => {
        setInputValues(prev => ({ ...prev, [name]: value }))
    }

    const handleCall = async () => {
        if (isReadFunction) {
            try {
                const result = await refetchRead()
                setReadResult(result.data)
            } catch (error) {
                console.error('Read error:', error)
                setReadResult({ error: error instanceof Error ? error.message : 'Unknown error' })
            }
        } else {
            try {
                const args = contractFunction.inputs.map(input => {
                    const value = inputValues[input.name] || ''
                    if (input.type.includes('uint') || input.type.includes('int')) {
                        return value ? BigInt(value) : BigInt(0)
                    }
                    if (input.type === 'bool') {
                        return value === 'true'
                    }
                    return value
                })

                writeContract({
                    address: contractAddress,
                    abi: abi,
                    functionName: contractFunction.name,
                    args: args,
                })
            } catch (error) {
                console.error('Write error:', error)
            }
        }
    }

    return (
        <div className="p-2.5 bg-gray-800 rounded border border-gray-700">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">{contractFunction.name}</h3>
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${isReadFunction ? 'bg-blue-700' : 'bg-orange-700'
                    }`}>
                    {isReadFunction ? 'READ' : 'WRITE'}
                </span>
            </div>

            {contractFunction.inputs.length > 0 && (
                <div className="space-y-1.5 mb-2">
                    {contractFunction.inputs.map((input, idx) => (
                        <div key={idx}>
                            <label className="block text-xs text-gray-400 mb-0.5">
                                {input.name || `param${idx}`} <span className="text-gray-500">({input.type})</span>
                            </label>
                            <input
                                type="text"
                                value={inputValues[input.name] || ''}
                                onChange={(e) => handleInputChange(input.name, e.target.value)}
                                className="w-full px-2 py-1 bg-gray-900 border border-gray-600 rounded text-sm text-white"
                                placeholder={`Enter ${input.type}`}
                            />
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={handleCall}
                disabled={isPending || isConfirming}
                className={`w-full px-3 py-1.5 rounded transition-colors text-sm font-medium ${isReadFunction
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Call'}
            </button>

            {/* Results Display */}
            {isReadFunction && readResult !== null && (
                <div className="mt-2 p-2 bg-gray-900 rounded border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">Result:</div>
                    <div className="font-mono text-xs break-all">
                        {typeof readResult === 'object' && readResult !== null && 'error' in readResult
                            ? <span className="text-red-400">{String(readResult.error)}</span>
                            : JSON.stringify(typeof readResult === 'object' && readResult !== null && 'toString' in readResult ? readResult.toString() : readResult, null, 2)
                        }
                    </div>
                </div>
            )}

            {!isReadFunction && hash && (
                <div className="mt-2 p-2 bg-gray-900 rounded border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">TX Hash:</div>
                    <div className="font-mono text-xs break-all">{hash}</div>
                    {isSuccess && (
                        <div className="mt-1 text-green-400 text-xs">✓ Confirmed!</div>
                    )}
                </div>
            )}
        </div>
    )
}
