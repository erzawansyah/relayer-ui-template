import { useAccount } from "wagmi"
import Header from "./components/Header"
import ConnectBox from "./components/ConnectBox"
import ThemeController from "./components/ThemeController"
import { useEffect, useState } from "react"
import { useContractLoader } from "./hooks/useContractLoader"
import ContractInfo from "./components/ContractInfo"

const initialContracts = ["fhe-counter", "fhe-add"]

function App() {
  const [contracts, setContracts] = useState<string[]>([])
  const [active, setActive] = useState<string>(initialContracts[0])
  const { data, error, isLoading } = useContractLoader(active);
  const account = useAccount();

  useEffect(() => {
    const loadContracts = async () => {
      // simulate delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      // In real scenario, fetch available contracts from backend or config
      setContracts(initialContracts)
    }
    loadContracts()
  }, [])

  if (!account.isConnected) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <ConnectBox />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/*Handle active contract to display */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Contracts</h1>
          <div className="flex space-x-4">
            {contracts.map((contract) => (
              <button
                key={contract}
                className={`px-4 py-2 rounded border ${active === contract ? 'bg-primary text-white border-primary' : 'bg-surface text-fg border-surface-2'}`}
                onClick={() => setActive(contract)}
              >
                {contract}
              </button>
            ))}
          </div>
        </div>
        {
          error ? (
            <div className="text-red-500">Failed to load: {error}</div>
          ) : isLoading || !data ? (
            <div>Loading contract...</div>
          ) : (
            <ContractInfo address={data.address} metadata={data.metadata} />
          )
        }
      </div>

      {/* Footer with Theme Controller */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 items-end">
        <ThemeController />
        <div className="text-xs text-fg-muted bg-surface/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-surface-2 shadow-lg">
          Connected: <span className="font-mono text-fg">{account.address?.substring(0, 6)}...{account.address?.substring(38)}</span>
        </div>
      </div>
    </div>
  )
}

export default App
