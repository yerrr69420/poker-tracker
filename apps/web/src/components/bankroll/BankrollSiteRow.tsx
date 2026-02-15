'use client';

import { formatCurrency } from '@poker-tracker/shared';
import type { BankrollSiteEntry } from '@poker-tracker/shared';
import ChipStack from '../ui/ChipStack';

interface Props {
  entry: BankrollSiteEntry;
}

export default function BankrollSiteRow({ entry }: Props) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border">
      <ChipStack amount={entry.amount} maxChips={5} />
      <div className="flex-1 flex items-center gap-2">
        <span className="text-sm font-medium text-text-primary">{entry.site.name}</span>
        {entry.isManualOverride && (
          <span className="text-xs text-warning bg-warning/10 px-1.5 py-0.5 rounded">
            manual
          </span>
        )}
      </div>
      <span className="text-lg font-bold text-text-primary">{formatCurrency(entry.amount)}</span>
    </div>
  );
}
