declare module '@bc-forge/react' {
  export const bcForgeProvider: any;
  export const bcForgeVestingProvider: any;

  export interface bcForgeProviderProps {
    config: { rpcUrl: string; networkPassphrase: string; contractId: string; walletAdapter?: any };
    children: any;
  }

  export interface bcForgeVestingProviderProps {
    config: { rpcUrl: string; networkPassphrase: string; contractId: string; walletAdapter?: any };
    children: any;
  }

  export function useBcForgeClient(): any;
  export function useBcForgeVestingClient(): any;
  export function useBcForgeToken(): any;
  export function useBalance(address: string | undefined): any;
  export function useMint(): any;
  export function useTotalSupply(): any;
  export function useTransfer(): any;
  export function useApprove(): any;
  export function useBurn(): any;
  export function useAllowance(owner: string | undefined, spender: string | undefined): any;
  export function useLockedBalance(address: string | undefined): any;
  export function useLockupInfo(address: string | undefined): any;
  export function useLockTokens(): any;
  export function useWithdrawLocked(): any;
  export function useVestingSchedules(address: string | undefined): any;
  export function useCreateVesting(): any;
  export function useRelease(): any;
  export function useRevokeVesting(): any;
}

declare global {
  namespace JSX {
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
}
