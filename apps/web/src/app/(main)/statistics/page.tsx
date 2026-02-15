'use client';

import { formatProfit, formatDuration } from '@poker-tracker/shared';
import { useSessions } from '@/hooks/useSessions';
import { useStatistics } from '@/hooks/useStatistics';
import NeonCard from '@/components/ui/NeonCard';

function StatRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-border/50 last:border-0">
      <span className="text-text-secondary text-sm">{label}</span>
      <span className={`font-medium tabular-nums ${valueClassName ?? 'text-text-primary'}`}>
        {value}
      </span>
    </div>
  );
}

function statsValueClass(cents: number): string {
  if (cents === 0) return 'text-text-primary';
  return cents > 0 ? 'text-profit' : 'text-loss';
}

function StatsBlock({
  title,
  stats,
}: {
  title: string;
  stats: ReturnType<typeof useStatistics>['all'];
}) {
  return (
    <NeonCard className="card-edge matrix-card-hover">
      <h3 className="text-primary font-semibold text-lg mb-4">{title}</h3>
      <div className="space-y-0">
        <StatRow
          label="Net result"
          value={formatProfit(stats.netResult)}
          valueClassName={statsValueClass(stats.netResult)}
        />
        <StatRow
          label="Net hourly rate"
          value={formatProfit(stats.netHourlyRate)}
          valueClassName={statsValueClass(stats.netHourlyRate)}
        />
        <StatRow
          label="Average net result"
          value={formatProfit(stats.averageNetResult)}
          valueClassName={statsValueClass(stats.averageNetResult)}
        />
        <StatRow label="Number of sessions" value={String(stats.numberOfSessions)} />
        <StatRow
          label="Average duration"
          value={formatDuration(Math.round(stats.averageDurationMinutes))}
        />
        <StatRow
          label="Duration of play"
          value={formatDuration(Math.round(stats.totalMinutes))}
        />
        <StatRow
          label="Win ratio"
          value={
            stats.numberOfSessions > 0
              ? `${(stats.winRatio * 100).toFixed(1)}%`
              : '--'
          }
        />
      </div>
    </NeonCard>
  );
}

export default function StatisticsPage() {
  const { sessions, loading } = useSessions();
  const { all, cash, tournament } = useStatistics(sessions);

  return (
    <div className="max-w-3xl mx-auto space-y-6 chip-accent rounded-2xl pt-2 pb-4 relative z-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Statistics</h1>
        <span className="text-xs text-text-muted px-3 py-1 rounded-full border border-border bg-bg-card">
          SESSIONS
        </span>
      </div>

      {loading ? (
        <p className="text-text-muted">Loading...</p>
      ) : sessions.length === 0 ? (
        <NeonCard>
          <p className="text-text-muted text-center py-8">
            Add sessions to see your statistics here.
          </p>
        </NeonCard>
      ) : (
        <div className="space-y-6">
          <StatsBlock title="All sessions" stats={all} />

          <h2 className="text-lg font-semibold text-primary mt-8">Cash games</h2>
          <StatsBlock title="Cash" stats={cash} />

          <h2 className="text-lg font-semibold text-primary mt-8">Tournaments</h2>
          <StatsBlock title="Tournaments" stats={tournament} />
        </div>
      )}
    </div>
  );
}
