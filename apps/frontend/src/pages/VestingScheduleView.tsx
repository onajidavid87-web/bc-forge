import { useMemo } from 'react';
import { useBcForgeToken, useVestingSchedules } from '@bc-forge/react';
import VestingScheduleCard from '../components/VestingScheduleCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import type { VestingInfo } from '@bc-forge/sdk';

function useCurrentLedger(): number {
  return useMemo(() => Math.floor(Date.now() / 5000) + 50000, []);
}

export default function VestingScheduleView() {
  const { data: tokenInfo, loading: tokenLoading } = useBcForgeToken();
  const beneficiary = useMemo(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('address') || '';
    }
    return '';
  }, []);

  const {
    data: schedules,
    loading,
    error,
    refetch,
  } = useVestingSchedules(beneficiary || undefined);

  const currentLedger = useCurrentLedger();
  const decimals = tokenInfo?.decimals ?? 7;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Lockup &amp; Vesting Schedule</h1>
        <p className="mt-1 text-sm text-gray-500">
          View all vesting schedules and lockup details for a beneficiary address.
        </p>
      </div>

      <div className="mb-8">
        <label htmlFor="address-input" className="block text-sm font-medium text-gray-700 mb-1.5">
          Beneficiary Address
        </label>
        <div className="flex gap-3">
          <input
            id="address-input"
            type="text"
            defaultValue={beneficiary}
            placeholder="G... or C... address"
            className="block w-full max-w-lg rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-xs placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const url = new URL(window.location.href);
                url.searchParams.set('address', (e.target as HTMLInputElement).value);
                window.location.search = url.searchParams.toString();
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.getElementById('address-input') as HTMLInputElement;
              if (input?.value) {
                const url = new URL(window.location.href);
                url.searchParams.set('address', input.value);
                window.location.search = url.searchParams.toString();
              }
            }}
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
          >
            Search
          </button>
        </div>
      </div>

      {!beneficiary && !loading && (
        <EmptyState
          title="Enter an address to get started"
          description="Paste a Stellar public key or contract address above to view their vesting schedules and lockup details."
        />
      )}

      {beneficiary && loading && <LoadingSkeleton count={3} />}

      {beneficiary && error && !loading && (
        <ErrorState
          message={error.message || 'Failed to load vesting schedules. Please try again.'}
          onRetry={refetch}
        />
      )}

      {beneficiary && !loading && !error && schedules && schedules.length === 0 && (
        <EmptyState />
      )}

      {beneficiary && !loading && !error && schedules && schedules.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {schedules.length} schedule{schedules.length !== 1 ? 's' : ''} found
            </p>
            {tokenLoading && (
              <span className="text-xs text-gray-400">Loading token info...</span>
            )}
          </div>
          <div className="space-y-4">
            {schedules.map((schedule: VestingInfo) => (
              <VestingScheduleCard
                key={schedule.schedule_id}
                schedule={schedule}
                currentLedger={currentLedger}
                decimals={decimals}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
