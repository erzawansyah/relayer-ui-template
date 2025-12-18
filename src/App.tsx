import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import Header from "./components/Header"
import ConnectBox from "./components/ConnectBox"
import ThemeController from "./components/ThemeController"
import { useContractLoader, type UseContractLoaderReturn } from "./hooks/useContractLoader"
import ContractInfo from "./components/ContractInfo"
import ContractTabs from "./components/tabs/ContractTabs"
import ReadmeTab from "./components/tabs/ReadmeTab"
import StatesTab from "./components/tabs/StatesTab"
import FunctionsTab from "./components/tabs/FunctionsTab"

// Dynamically get all contract folders from src/contracts directory
const getAvailableContracts = () => {
  const contractModules = import.meta.glob('./contracts/*/metadata.ts', { eager: true });
  const contractNames = Object.keys(contractModules).map(path => {
    const match = path.match(/\.\/contracts\/(.+?)\/metadata\.ts/);
    return match ? match[1] : null;
  }).filter(Boolean) as string[];
  return contractNames;
}

// Dynamically load README content
const readmeModules = import.meta.glob('./contracts/*/README.md', {
  query: '?raw',
  eager: true
}) as Record<string, { default: string }>;

const getReadmeContent = (contractName: string): string | null => {
  const path = `./contracts/${contractName}/README.md`;
  return readmeModules[path]?.default || null;
}

function App() {
  const [contracts, setContracts] = useState<string[]>([])
  const [active, setActive] = useState<string>("")
  const { data, error, isLoading } = useContractLoader(active);
  const account = useAccount();

  useEffect(() => {
    const loadContracts = async () => {
      // Get contracts dynamically from folder structure
      const availableContracts = getAvailableContracts();
      setContracts(availableContracts);

      // Set first contract as active
      if (availableContracts.length > 0 && !active) {
        setActive(availableContracts[0]);
      }
    }
    loadContracts()
  }, [active])

  if (!account.isConnected) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <ConnectBox />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-surface to-surface-2">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Compact Header with Contract Tabs */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold">Smart Contracts</h1>
            <div className="flex items-center gap-2">
              <ThemeController />
              <div className="text-xs text-fg-muted bg-surface/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-surface-2">
                {account.address?.substring(0, 4)}...{account.address?.substring(40)}
              </div>
            </div>
          </div>

          {/* Compact Contract Tabs */}
          <div className="flex gap-2">
            {contracts.map((contract) => (
              <button
                key={contract}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${active === contract
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface text-fg hover:bg-surface-2 border border-surface-2'
                  }`}
                onClick={() => setActive(contract)}
              >
                {contract.replace('fhe-', '').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        {
          error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">Failed to load: {error}</div>
          ) : isLoading || !data ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-fg-muted">Loading contract...</div>
            </div>
          ) : (
            <ContractContent data={data} />
          )
        }
      </div>
    </div>
  )
}

export default App

type ContractContentProps = UseContractLoaderReturn["data"]

function ContractContent({ data }: { data: ContractContentProps }) {
  const [activeTab, setActiveTab] = useState<'readme' | 'state' | 'read' | 'write'>('readme');
  const [readmeContent, setReadmeContent] = useState<string | null>(null);

  // Load README content
  useEffect(() => {
    const contractName = data?.metadata?.name;
    if (contractName) {
      const content = getReadmeContent(contractName);
      // Defer the state update to avoid synchronous setState inside the effect.
      Promise.resolve().then(() => setReadmeContent(content));
    } else {
      // Defer clearing when no contract is selected.
      Promise.resolve().then(() => setReadmeContent(null));
    }
  }, [data?.metadata?.name]);

  if (!data) return null;

  // Separate read and write functions
  const readFunctions = data.ui.functions?.filter(f => f.type === 'read') || [];
  const writeFunctions = data.ui.functions?.filter(f => f.type === 'write') || [];

  const tabs = [
    { id: 'readme' as const, label: 'README', count: null },
    { id: 'state' as const, label: 'States', count: data.ui.states?.length || 0 },
    { id: 'read' as const, label: 'Read', count: readFunctions.length },
    { id: 'write' as const, label: 'Write', count: writeFunctions.length },
  ];

  return (
    <div className="space-y-4">
      {/* Compact Contract Info Card */}
      <ContractInfo address={data.address} metadata={data.metadata} />

      {/* Tabs Section */}
      <div className="bg-surface rounded-xl border border-surface-2 shadow-sm overflow-hidden">
        {/* Tab Navigation */}
        <ContractTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        <div className="p-4 max-h-210 overflow-y-auto">
          {activeTab === 'readme' && <ReadmeTab content={readmeContent} />}
          {activeTab === 'state' && <StatesTab states={data.ui.states || []} />}
          {activeTab === 'read' && <FunctionsTab functions={readFunctions} type="read" />}
          {activeTab === 'write' && <FunctionsTab functions={writeFunctions} type="write" />}
        </div>
      </div>
    </div>
  )
}
