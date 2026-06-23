import {
  SorobanRpc,
  Contract,
  TransactionBuilder,
  Keypair,
  xdr,
  nativeToScVal,
} from '@stellar/stellar-sdk';

import {
  buildInvokeTransaction,
  submitTransaction,
  addressToScVal,
  i128ToScVal,
  u32ToScVal,
  scValToNative,
  buildUnsignedTransaction,
} from './utils';

import { SimulationError, RPCError } from './errors';
import type { WalletAdapter } from './walletAdapter';

export interface VestingClientConfig {
  rpcUrl: string;
  networkPassphrase: string;
  contractId: string;
  walletAdapter?: WalletAdapter;
}

export interface TransactionResult {
  success: boolean;
  hash: string;
  returnValue?: any;
}

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

export class VestingClient {
  private rpcUrl: string;
  private networkPassphrase: string;
  private contractId: string;
  private server: SorobanRpc.Server;
  private contract: Contract;
  private walletAdapter?: WalletAdapter;

  constructor(config: VestingClientConfig) {
    this.rpcUrl = config.rpcUrl;
    this.networkPassphrase = config.networkPassphrase;
    this.contractId = config.contractId;
    this.server = new SorobanRpc.Server(this.rpcUrl);
    this.contract = new Contract(this.contractId);
    this.walletAdapter = config.walletAdapter;
  }

  setWalletAdapter(adapter?: WalletAdapter) {
    this.walletAdapter = adapter;
  }

  async connectWallet(): Promise<string | undefined> {
    if (!this.walletAdapter) throw new Error('No wallet adapter configured');
    await this.walletAdapter.connect();
    return this.walletAdapter.publicKey;
  }

  async disconnectWallet(): Promise<void> {
    if (!this.walletAdapter) return;
    await this.walletAdapter.disconnect();
  }

  async initialize(adminAddress: string, token: string, source?: Keypair): Promise<TransactionResult> {
    return this.invokeContract(
      'initialize',
      [addressToScVal(adminAddress), addressToScVal(token)],
      source,
    );
  }

  async createVesting(
    beneficiary: string,
    amount: bigint,
    cliff: number,
    duration: number,
    revocable: boolean,
    source?: Keypair,
  ): Promise<TransactionResult> {
    return this.invokeContract(
      'create_vesting',
      [
        addressToScVal(beneficiary),
        i128ToScVal(amount),
        u32ToScVal(cliff),
        u32ToScVal(duration),
        nativeToScVal(revocable),
      ],
      source,
    );
  }

  async release(beneficiary: string, source?: Keypair): Promise<TransactionResult> {
    return this.invokeContract('release', [addressToScVal(beneficiary)], source);
  }

  async revoke(scheduleId: number, source?: Keypair): Promise<TransactionResult> {
    return this.invokeContract(
      'revoke',
      [nativeToScVal(scheduleId, { type: 'u64' })],
      source,
    );
  }

  async getVestingInfo(beneficiary: string): Promise<VestingInfo[]> {
    const result = await this.queryContract('get_vesting_info', [addressToScVal(beneficiary)]);
    const raw = scValToNative(result) as any[];
    return raw.map((item: any) => ({
      schedule_id: Number(item.schedule_id),
      schedule: {
        beneficiary: item.schedule.beneficiary,
        total_amount: BigInt(item.schedule.total_amount),
        cliff_ledger: Number(item.schedule.cliff_ledger),
        end_ledger: Number(item.schedule.end_ledger),
        released_amount: BigInt(item.schedule.released_amount),
        revocable: Boolean(item.schedule.revocable),
      },
      start_ledger: Number(item.start_ledger),
      claimable_amount: BigInt(item.claimable_amount),
      revoked: Boolean(item.revoked),
    }));
  }

  async getEvents(startLedger?: number): Promise<any[]> {
    const response = await this.server.getEvents({
      startLedger: startLedger || (await this.server.getLatestLedger()).sequence - 1000,
      filters: [{ contractIds: [this.contractId], type: 'contract' }],
    });
    return response.events;
  }

  async pollEvents(cursor?: string): Promise<{ events: any[]; cursor: string }> {
    const response = await this.server.getEvents({
      cursor,
      filters: [{ contractIds: [this.contractId], type: 'contract' }],
    });
    return {
      events: response.events,
      cursor: response.cursor,
    };
  }

  private async withRetry<T>(fn: () => Promise<T>, retries: number = 3): Promise<T> {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }
    throw lastError;
  }

  private async queryContract(method: string, args: xdr.ScVal[]): Promise<xdr.ScVal> {
    return this.withRetry(async () => {
      try {
        const account = new (await import('@stellar/stellar-sdk')).Account(
          'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
          '0',
        );

        const tx = new TransactionBuilder(account, {
          fee: '100',
          networkPassphrase: this.networkPassphrase,
        })
          .addOperation(this.contract.call(method, ...args))
          .setTimeout(30)
          .build();

        const simulated = await this.server.simulateTransaction(tx);

        if (SorobanRpc.Api.isSimulationError(simulated)) {
          throw new SimulationError(`Query failed: ${simulated.error}`, simulated.error);
        }

        if (!SorobanRpc.Api.isSimulationSuccess(simulated) || !simulated.result) {
          throw new SimulationError('Query returned no result');
        }

        return simulated.result.retval;
      } catch (error: any) {
        if (error instanceof SimulationError) throw error;
        throw new RPCError('RPC call failed', error);
      }
    });
  }

  private async invokeContract(
    method: string,
    args: xdr.ScVal[],
    source?: Keypair,
  ): Promise<TransactionResult> {
    return this.withRetry(async () => {
      try {
        if (source) {
          const txXdr = await buildInvokeTransaction(
            this.rpcUrl,
            this.networkPassphrase,
            this.contractId,
            method,
            args,
            source,
          );

          const response = await submitTransaction(this.rpcUrl, txXdr);

          if (response.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
            return {
              success: true,
              hash: (response as any).hash,
              returnValue: response.returnValue ? scValToNative(response.returnValue) : undefined,
            };
          }

          return {
            success: false,
            hash: (response as any).hash,
          };
        }

        if (!this.walletAdapter) throw new Error('No signing source provided');
        if (!this.walletAdapter.connected || !this.walletAdapter.publicKey)
          throw new Error('Wallet adapter not connected');

        const unsignedXdr = await buildUnsignedTransaction(
          this.rpcUrl,
          this.networkPassphrase,
          this.contractId,
          method,
          args,
          this.walletAdapter.publicKey,
        );

        const signedXdr = await this.walletAdapter.signTransaction(unsignedXdr);

        const response = await submitTransaction(this.rpcUrl, signedXdr);

        if (response.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
          return {
            success: true,
            hash: (response as any).hash,
            returnValue: response.returnValue ? scValToNative(response.returnValue) : undefined,
          };
        }

        return {
          success: false,
          hash: (response as any).hash,
        };
      } catch (error: any) {
        if (error instanceof SimulationError) throw error;
        throw error;
      }
    });
  }
}
