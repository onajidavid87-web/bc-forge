import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { bcForgeClient, bcForgeClientConfig, VestingClient, VestingClientConfig } from '@bc-forge/sdk';

interface bcForgeContextType {
  client: bcForgeClient | null;
}

interface bcForgeVestingContextType {
  client: VestingClient | null;
}

const bcForgeContext = createContext<bcForgeContextType>({ client: null });
const bcForgeVestingContext = createContext<bcForgeVestingContextType>({ client: null });

export interface bcForgeProviderProps {
  config: bcForgeClientConfig;
  children: ReactNode;
}

export interface bcForgeVestingProviderProps {
  config: VestingClientConfig;
  children: ReactNode;
}

export const bcForgeProvider: React.FC<bcForgeProviderProps> = ({ config, children }) => {
  const client = useMemo(() => new bcForgeClient(config), [config.rpcUrl, config.networkPassphrase, config.contractId]);

  return (
    <bcForgeContext.Provider value={{ client }}>
      {children}
    </bcForgeContext.Provider>
  );
};

export const bcForgeVestingProvider: React.FC<bcForgeVestingProviderProps> = ({ config, children }) => {
  const client = useMemo(() => new VestingClient(config), [config.rpcUrl, config.networkPassphrase, config.contractId]);

  return (
    <bcForgeVestingContext.Provider value={{ client }}>
      {children}
    </bcForgeVestingContext.Provider>
  );
};

export const useBcForgeClient = () => {
  const context = useContext(bcForgeContext);
  if (!context.client) {
    throw new Error('useBcForgeClient must be used within a bcForgeProvider');
  }
  return context.client;
};

export const useBcForgeVestingClient = () => {
  const context = useContext(bcForgeVestingContext);
  if (!context.client) {
    throw new Error('useBcForgeVestingClient must be used within a bcForgeVestingProvider');
  }
  return context.client;
};
