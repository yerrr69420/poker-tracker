'use client';

import Link from 'next/link';
import { formatProfit, formatDuration } from '@poker-tracker/shared';
import { useSessions, useDashboardStats } from '@/hooks/useSessions';
import NeonCard from '@/components/ui/NeonCard';
import MascotHeader from '@/components/mascot/MascotHeader';
import SessionCard from '@/components/sessions/SessionCard';
import SiteBreakdown from '@/components/sessions/SiteBreakdown';

export default function DashboardPage() {
  const { sessions, loading, reload } = useSessions();
  const stats = useDashboardStats(sessions);

  const mood = stats.todayProfit > 0 ? 'profit' : stats.todayProfit < 0 ? 'loss' : 'neutral';
  const recentSessions = sessions.slice(0, 10);

  return (
    <div className="max-w-3xl mx-auto space-y-6 chip-accent rounded-2xl pt-2 pb-4 relative z-20">
      <MascotHeader
        title="Today's Session"
        subtitle={`${stats.todaySessions} session${stats.todaySessions !== 1 ? 's' : ''} today`}
        mood={mood}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        <NeonCard glowColor={stats.todayProfit >= 0 ? 'green' : 'red'} pulse={stats.todayProfit !== 0} className="card-edge">
          <p className="text-sm text-text-secondary">Today&apos;s P&amp;L</p>
          <p className={`text-xl font-bold mt-1 ${stats.todayProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
            {formatProfit(stats.todayProfit)}
          </p>
        </NeonCard>

        <NeonCard className="card-edge">
          <p className="text-sm text-text-secondary">Hours</p>
          <p className="text-xl font-bold mt-1 text-text-primary">
            {formatDuration(stats.todayHours * 60)}
          </p>
        </NeonCard>

        <NeonCard className="card-edge">
          <p className="text-sm text-text-secondary">This Week</p>
          <p className={`text-xl font-bold mt-1 ${stats.weekProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
            {formatProfit(stats.weekProfit)}
          </p>
        </NeonCard>

        <NeonCard className="card-edge">
          <p className="text-sm text-text-secondary">This Month</p>
          <p className={`text-xl font-bold mt-1 ${stats.monthProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
            {formatProfit(stats.monthProfit)}
          </p>
        </NeonCard>
      </div>

      <SiteBreakdown sites={stats.siteBreakdown} />

      {/* Add Session button - chip-style with glow */}
      <Link
        href="/sessions/new"
        className="block text-center bg-primary text-text-inverse font-bold py-4 rounded-xl hover:opacity-95 transition-all shadow-[0_0_20px_rgba(0,229,255,0.35)] hover:shadow-[0_0_28px_rgba(0,229,255,0.5)] border border-primary/40 matrix-hover"
      >
        ◎ + Add Session
      </Link>

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Recent Sessions
          </h3>
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <SessionCard key={session.id} session={session} onUpdated={reload} />
            ))}
          </div>
        </div>
      )}

      {!loading && sessions.length === 0 && (
        <p className="text-text-muted text-center py-8">No sessions yet. Add your first one!</p>
      )}
    </div>
  );
}
