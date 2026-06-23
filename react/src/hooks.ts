import { useState, useEffect, useCallback } from 'react';
import { useBcForgeClient, useBcForgeVestingClient } from './context';
import { Keypair } from '@stellar/stellar-sdk';

/**
 * Hook to fetch basic token information (name, symbol, decimals).
 */
export function useBcForgeToken() {
  const client = useBcForgeClient();
  const [data, setData] = useState<{ name: string; symbol: string; decimals: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [name, symbol, decimals] = await Promise.all([
          client.getName(),
          client.getSymbol(),
          client.getDecimals(),
        ]);
        setData({ name, symbol, decimals });
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [client]);

  return { data, loading, error };
}

/**
 * Hook to fetch the balance of a specific address.
 */
export function useBalance(address: string | undefined) {
  const client = useBcForgeClient();
  const [data, setData] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!address) return;
    try {
      setLoading(true);
      const balance = await client.getBalance(address);
      setData(balance);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [client, address]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { data, loading, error, refetch: fetchBalance };
}

/**
 * Hook to perform mint operations.
 */
export function useMint() {
  const client = useBcForgeClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mint = useCallback(async (to: string, amount: bigint, source: Keypair) => {
    try {
      setLoading(true);
      setError(null);
      const result = await client.mint(to, amount, source);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [client]);

  return { mint, loading, error };
}

/**
 * Hook to fetch the total supply of the token.
 */
export function useTotalSupply() {
  const client = useBcForgeClient();
  const [data, setData] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTotalSupply = useCallback(async () => {
    try {
      setLoading(true);
      const supply = await client.getTotalSupply();
      setData(supply);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    fetchTotalSupply();
  }, [fetchTotalSupply]);

  return { data, loading, error, refetch: fetchTotalSupply };
}

/**
 * Hook to perform transfer operations.
 */
export function useTransfer() {
  const client = useBcForgeClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const transfer = useCallback(async (from: string, to: string, amount: bigint, source: Keypair) => {
    try {
      setLoading(true);
      setError(null);
      const result = await client.transfer(from, to, amount, source);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [client]);

  return { transfer, loading, error };
}

/**
 * Hook to perform approve operations.
 */
export function useApprove() {
  const client = useBcForgeClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const approve = useCallback(async (from: string, spender: string, amount: bigint, source: Keypair) => {
    try {
      setLoading(true);
      setError(null);
      const result = await client.approve(from, spender, amount, source);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [client]);

  return { approve, loading, error };
}

/**
 * Hook to perform burn operations.
 */
export function useBurn() {
  const client = useBcForgeClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const burn = useCallback(async (from: string, amount: bigint, source: Keypair) => {
    try {
      setLoading(true);
      setError(null);
      const result = await client.burn(from, amount, source);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [client]);

  return { burn, loading, error };
}

/**
 * Hook to fetch the allowance between owner and spender.
 */
export function useAllowance(owner: string | undefined, spender: string | undefined) {
  const client = useBcForgeClient();
  const [data, setData] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAllowance = useCallback(async () => {
    if (!owner || !spender) return;
    try {
      setLoading(true);
      const allowance = await client.getAllowance(owner, spender);
      setData(allowance);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [client, owner, spender]);

  useEffect(() => {
    fetchAllowance();
  }, [fetchAllowance]);

  return { data, loading, error, refetch: fetchAllowance };
}

// ─── Lockup Hooks ─────────────────────────────────────────────────────────────

/**
 * Hook to fetch the locked token balance for an address.
 */
export function useLockedBalance(address: string | undefined) {
  const client = useBcForgeClient();
  const [data, setData] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLocked = useCallback(async () => {
    if (!address) return;
    try {
      setLoading(true);
      const amount = await client.getLockedAmount(address);
      setData(amount);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [client, address]);

  useEffect(() => {
    fetchLocked();
  }, [fetchLocked]);

  return { data, loading, error, refetch: fetchLocked };
}

/**
 * Hook to fetch the full lockup info (amount + unlock_time) for an address.
 */
export function useLockupInfo(address: string | undefined) {
  const client = useBcForgeClient();
  const [data, setData] = useState<{ amount: bigint; unlock_time: bigint } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchInfo = useCallback(async () => {
    if (!address) return;
    try {
      setLoading(true);
      const info = await client.getLockupInfo(address);
      setData(info);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [client, address]);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  return { data, loading, error, refetch: fetchInfo };
}

/**
 * Hook to perform lock token operations.
 */
export function useLockTokens() {
  const client = useBcForgeClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const lock = useCallback(async (user: string, amount: bigint, unlockTime: bigint, source: Keypair) => {
    try {
      setLoading(true);
      setError(null);
      const result = await client.lockTokens(user, amount, unlockTime, source);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [client]);

  return { lock, loading, error };
}

/**
 * Hook to withdraw matured locked tokens.
 */
export function useWithdrawLocked() {
  const client = useBcForgeClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const withdraw = useCallback(async (user: string, source: Keypair) => {
    try {
      setLoading(true);
      setError(null);
      const result = await client.withdrawLocked(user, source);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [client]);

  return { withdraw, loading, error };
}

// ─── Vesting Hooks ────────────────────────────────────────────────────────────

/**
 * Hook to fetch vesting schedules for a beneficiary address.
 */
export function useVestingSchedules(address: string | undefined) {
  const client = useBcForgeVestingClient();
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSchedules = useCallback(async () => {
    if (!address) return;
    try {
      setLoading(true);
      const schedules = await client.getVestingInfo(address);
      setData(schedules);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [client, address]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return { data, loading, error, refetch: fetchSchedules };
}

/**
 * Hook to create a new vesting schedule.
 */
export function useCreateVesting() {
  const client = useBcForgeVestingClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(
    async (beneficiary: string, amount: bigint, cliff: number, duration: number, revocable: boolean, source: Keypair) => {
      try {
        setLoading(true);
        setError(null);
        const result = await client.createVesting(beneficiary, amount, cliff, duration, revocable, source);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [client],
  );

  return { create, loading, error };
}

/**
 * Hook to release vested tokens for a beneficiary.
 */
export function useRelease() {
  const client = useBcForgeVestingClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const release = useCallback(async (beneficiary: string, source: Keypair) => {
    try {
      setLoading(true);
      setError(null);
      const result = await client.release(beneficiary, source);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [client]);

  return { release, loading, error };
}

/**
 * Hook to revoke a vesting schedule.
 */
export function useRevokeVesting() {
  const client = useBcForgeVestingClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const revoke = useCallback(async (scheduleId: number, source: Keypair) => {
    try {
      setLoading(true);
      setError(null);
      const result = await client.revoke(scheduleId, source);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [client]);

  return { revoke, loading, error };
}
