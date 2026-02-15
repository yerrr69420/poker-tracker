import { formatProfit } from '@poker-tracker/shared';
import type { SiteProfit } from '@poker-tracker/shared';

interface Props {
  sites: SiteProfit[];
}

export default function SiteBreakdown({ sites }: Props) {
  if (sites.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
        By Site
      </h4>
      <div className="divide-y divide-border">
        {sites.map((entry) => {
          const isProfit = entry.profit >= 0;
          return (
            <div key={entry.site.id} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-text-primary">{entry.site.name}</p>
                <p className="text-xs text-text-muted">
                  {entry.sessionCount} session{entry.sessionCount !== 1 ? 's' : ''}
                </p>
              </div>
              <span className={`text-sm font-bold ${isProfit ? 'text-profit' : 'text-loss'}`}>
                {formatProfit(entry.profit)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
