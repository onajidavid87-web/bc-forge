declare module '@bc-forge/sdk' {
  export interface VestingSchedule {
    beneficiary: string;
    total_amount: bigint;
    cliff_ledger: number;
    end_ledger: number;
    released_amount: bigint;
    revocable: boolean;
  }

  export interface VestingInfo {
    schedule_id: number;
    schedule: VestingSchedule;
    start_ledger: number;
    claimable_amount: bigint;
    revoked: boolean;
  }

  export interface TransactionResult {
    success: boolean;
    hash: string;
    returnValue?: any;
  }

  export interface VestingClientConfig {
    rpcUrl: string;
    networkPassphrase: string;
    contractId: string;
    walletAdapter?: any;
  }

  export class VestingClient {
    constructor(config: VestingClientConfig);
    setWalletAdapter(adapter?: any): void;
    connectWallet(): Promise<string | undefined>;
    disconnectWallet(): Promise<void>;
    initialize(adminAddress: string, token: string, source?: any): Promise<TransactionResult>;
    createVesting(beneficiary: string, amount: bigint, cliff: number, duration: number, revocable: boolean, source?: any): Promise<TransactionResult>;
    release(beneficiary: string, source?: any): Promise<TransactionResult>;
    revoke(scheduleId: number, source?: any): Promise<TransactionResult>;
    getVestingInfo(beneficiary: string): Promise<VestingInfo[]>;
    getEvents(startLedger?: number): Promise<any[]>;
    pollEvents(cursor?: string): Promise<{ events: any[]; cursor: string }>;
  }

  export interface bcForgeClientConfig {
    rpcUrl: string;
    networkPassphrase: string;
    contractId: string;
    walletAdapter?: any;
  }

  export class bcForgeClient {
    constructor(config: bcForgeClientConfig);
    getBalance(address: string): Promise<bigint>;
    getTotalSupply(): Promise<bigint>;
    getName(): Promise<string>;
    getSymbol(): Promise<string>;
    getDecimals(): Promise<number>;
    lockTokens(user: string, amount: bigint, unlockTime: bigint, source?: any): Promise<TransactionResult>;
    withdrawLocked(user: string, source?: any): Promise<TransactionResult>;
    getLockedAmount(address: string): Promise<bigint>;
    getLockupInfo(address: string): Promise<{ amount: bigint; unlock_time: bigint } | null>;
  }
}
