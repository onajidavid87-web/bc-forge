import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { bcForgeProvider, bcForgeVestingProvider } from '@bc-forge/react';
import App from './App';
import './index.css';

const tokenConfig = {
  rpcUrl: import.meta.env.VITE_RPC_URL || 'https://soroban-testnet.stellar.org',
  networkPassphrase: import.meta.env.VITE_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
  contractId: import.meta.env.VITE_TOKEN_CONTRACT_ID || '',
};

const vestingConfig = {
  rpcUrl: import.meta.env.VITE_RPC_URL || 'https://soroban-testnet.stellar.org',
  networkPassphrase: import.meta.env.VITE_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
  contractId: import.meta.env.VITE_VESTING_CONTRACT_ID || '',
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <bcForgeProvider config={tokenConfig}>
        <bcForgeVestingProvider config={vestingConfig}>
          <App />
        </bcForgeVestingProvider>
      </bcForgeProvider>
    </BrowserRouter>
  </StrictMode>,
);
