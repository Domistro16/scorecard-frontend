import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import '@rainbow-me/rainbowkit/styles.css'
import { WagmiProvider, http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { bsc } from 'wagmi/chains'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

const config = getDefaultConfig({
  appName: 'ScorecardSafu',
  projectId: import.meta.env.VITE_REOWN,
  chains: [bsc],
  transports: {
    [bsc.id]: http(),
  },
})

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize='compact'>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
