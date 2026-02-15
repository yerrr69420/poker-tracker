'use client';

import { useMemo } from 'react';
import { formatProfit } from '@poker-tracker/shared';
import type { SessionWithSite, SiteProfit } from '@poker-tracker/shared';
import { useSessions } from '@/hooks/useSessions';
import NeonCard from '@/components/ui/NeonCard';

export default function ReportsPage() {
  const { sessions, loading } = useSessions();

  const siteBreakdown = useMemo(() => {
    const map = new Map<string, SiteProfit>();
    for (const s of sessions) {
      const existing = map.get(s.site_id);
      if (existing) {
        existing.profit += s.profit;
        existing.sessionCount += 1;
      } else {
        map.set(s.site_id, { site: s.site, profit: s.profit, sessionCount: 1 });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.profit - a.profit);
  }, [sessions]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 chip-accent rounded-2xl pt-2 pb-4 relative z-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Reports</h1>
        <span className="text-xs text-text-muted px-3 py-1 rounded-full border border-border bg-bg-card">
          SESSIONS
        </span>
      </div>

      {loading ? (
        <p className="text-text-muted">Loading...</p>
      ) : (
        <div className="space-y-6">
          {/* Where you perform best — by site */}
          <NeonCard className="card-edge matrix-card-hover">
            <h2 className="text-primary font-semibold text-lg mb-2">
              Where you perform best
            </h2>
            <p className="text-sm text-text-secondary mb-4">
              Net result by site (all time). More data will refine this view.
            </p>
            {siteBreakdown.length === 0 ? (
              <p className="text-text-muted text-sm py-4">
                Add sessions to see performance by site here.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {siteBreakdown.map((entry) => {
                  const isProfit = entry.profit >= 0;
                  return (
                    <div
                      key={entry.site.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div>
                        <p className="font-medium text-text-primary">{entry.site.name}</p>
                        <p className="text-xs text-text-muted">
                          {entry.sessionCount} session{entry.sessionCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <span
                        className={`font-bold tabular-nums ${
                          isProfit ? 'text-profit' : 'text-loss'
                        }`}
                      >
                        {formatProfit(entry.profit)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </NeonCard>

          {/* Custom reports placeholder */}
          <NeonCard className="card-edge matrix-card-hover">
            <h2 className="text-primary font-semibold text-lg mb-2">
              Custom reports
            </h2>
            <p className="text-text-secondary text-sm">
              This screen will show more detailed reports (e.g. by date range, stakes, or
              game type) when you have more data. You can also create custom reports using
              filters and exports in a future update.
            </p>
            <div className="mt-4 p-3 rounded-lg bg-bg-surface/50 border border-border/50 text-xs text-text-muted">
              Coming soon: date range filters, export to CSV, and saved report presets.
            </div>
          </NeonCard>
        </div>
      )}
    </div>
  );
}
