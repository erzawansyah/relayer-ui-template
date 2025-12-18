import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './wagmi.config'
import '@rainbow-me/rainbowkit/styles.css'
import './index.css'
import App from './App.tsx'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { FhevmProvider } from './lib/fhevm/FhevmProvider.tsx'


const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize='compact'
          appInfo={{
            appName: "FHEVM StarterKit",
          }}
        >
          <FhevmProvider>
            <App />
          </FhevmProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
