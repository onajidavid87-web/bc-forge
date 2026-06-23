import type { VestingInfo } from '@bc-forge/sdk';

type VestingSchedule = VestingInfo;

function formatAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatAmount(amount: bigint, decimals: number = 7): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  const fractionStr = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');
  return fractionStr ? `${whole}.${fractionStr}` : whole.toString();
}

function getProgressPercent(schedule: VestingSchedule['schedule'], startLedger: number, currentLedger: number): number {
  if (currentLedger >= schedule.end_ledger) return 100;
  if (currentLedger <= schedule.cliff_ledger) {
    if (currentLedger < schedule.cliff_ledger) return 0;
    if (schedule.cliff_ledger === schedule.end_ledger) return 100;
    return 0;
  }
  const total = schedule.end_ledger - startLedger;
  if (total === 0) return 100;
  const elapsed = currentLedger - startLedger;
  return Math.min(100, Math.round((elapsed / total) * 100));
}

function getStatus(
  schedule: VestingSchedule['schedule'],
  _startLedger: number,
  currentLedger: number,
  revoked: boolean,
): { label: string; color: string } {
  if (revoked) return { label: 'Revoked', color: 'bg-red-100 text-red-700' };
  if (currentLedger >= schedule.end_ledger) return { label: 'Fully Vested', color: 'bg-green-100 text-green-700' };
  if (currentLedger >= schedule.cliff_ledger) return { label: 'Vesting', color: 'bg-blue-100 text-blue-700' };
  return { label: 'Cliff', color: 'bg-yellow-100 text-yellow-700' };
}

function getReleaseProgress(schedule: VestingSchedule['schedule']): number {
  if (schedule.total_amount === 0n) return 0;
  return Number((schedule.released_amount * 100n) / schedule.total_amount);
}

interface VestingScheduleCardProps {
  schedule: VestingSchedule;
  currentLedger: number;
  decimals?: number;
}

export default function VestingScheduleCard({ schedule, currentLedger, decimals = 7 }: VestingScheduleCardProps) {
  const status = getStatus(schedule.schedule, schedule.start_ledger, currentLedger, schedule.revoked);
  const progressPct = getProgressPercent(schedule.schedule, schedule.start_ledger, currentLedger);
  const releasedPct = getReleaseProgress(schedule.schedule);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-gray-900">
            Schedule #{schedule.schedule_id}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px] sm:max-w-xs">
            {formatAddress(schedule.schedule.beneficiary)}
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">Total Amount</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatAmount(schedule.schedule.total_amount, decimals)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Claimable</p>
          <p className="text-sm font-semibold text-indigo-600 mt-0.5">{formatAmount(schedule.claimable_amount, decimals)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Released</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatAmount(schedule.schedule.released_amount, decimals)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Revocable</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{schedule.schedule.revocable ? 'Yes' : 'No'}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Vesting progress</span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>#{schedule.start_ledger}</span>
            <span>#{schedule.schedule.cliff_ledger}</span>
            <span>#{schedule.schedule.end_ledger}</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Released</span>
            <span>{releasedPct}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${releasedPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
