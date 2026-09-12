import type { Ownership, Responsibility, ResponsibilityArea } from '@/lib/types';
import { AREA_LABELS } from '@/lib/types';

export type LoadBalance = 'mostly_you' | 'mostly_partner' | 'shared' | 'unassigned' | 'none';

export interface AreaSummary {
  area: ResponsibilityArea;
  label: string;
  balance: LoadBalance;
  balanceLabel: string;
  counts: Record<Ownership, number>;
  total: number;
}

export function summarizeMentalLoad(
  responsibilities: Responsibility[],
  youName: string,
  partnerName: string,
): AreaSummary[] {
  const areas = Object.keys(AREA_LABELS) as ResponsibilityArea[];

  return areas
    .map((area) => {
      const items = responsibilities.filter((r) => r.status === 'open' && r.area === area);
      const counts: Record<Ownership, number> = {
        me: 0,
        partner: 0,
        shared: 0,
        unassigned: 0,
      };
      for (const item of items) counts[item.owner] += 1;

      const total = items.length;
      let balance: LoadBalance = 'none';
      let balanceLabel = 'Nothing open';

      if (total > 0) {
        if (counts.unassigned === total) {
          balance = 'unassigned';
          balanceLabel = 'Needs owners';
        } else if (counts.me > counts.partner + counts.shared) {
          balance = 'mostly_you';
          balanceLabel = `Mostly ${youName}`;
        } else if (counts.partner > counts.me + counts.shared) {
          balance = 'mostly_partner';
          balanceLabel = `Mostly ${partnerName}`;
        } else {
          balance = 'shared';
          balanceLabel = 'Shared';
        }
      }

      return {
        area,
        label: AREA_LABELS[area],
        balance,
        balanceLabel,
        counts,
        total,
      };
    })
    .filter((a) => a.area !== 'other' || a.total > 0);
}
