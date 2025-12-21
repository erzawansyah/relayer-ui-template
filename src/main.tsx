import App from './App.tsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { config } from './wagmi.config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { FhevmProvider } from './lib/fhevm/FhevmProvider.tsx'
import { ContractProvider } from './context/ContractContext.tsx'
import { Toaster } from "@/components/ui/sonner"
import '@rainbow-me/rainbowkit/styles.css'
import './index.css'


const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize='compact'
          appInfo={{
            appName: "FHEVM StarterKit",
            learnMoreUrl: "https://github.com/erzawansyah/fhevm-starterkit",
          }}
        >
          <FhevmProvider>
            <ContractProvider>
              <App />
              <Toaster position="top-right" />
            </ContractProvider>
          </FhevmProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
