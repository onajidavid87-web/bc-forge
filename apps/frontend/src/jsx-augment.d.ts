declare namespace JSX {
  interface IntrinsicElements {
    bcForgeProvider: {
      config: { rpcUrl: string; networkPassphrase: string; contractId: string; walletAdapter?: any };
      children: any;
    };
    bcForgeVestingProvider: {
      config: { rpcUrl: string; networkPassphrase: string; contractId: string; walletAdapter?: any };
      children: any;
    };
  }
}
