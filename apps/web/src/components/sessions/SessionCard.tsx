'use client';

import { useState, useEffect } from 'react';
import { formatProfit, formatDuration, durationMinutes, formatDate, centsToDollars, dollarsToCents } from '@poker-tracker/shared';
import type { SessionWithSite } from '@poker-tracker/shared';
import NeonCard from '../ui/NeonCard';
import { updateSession } from '@/lib/queries/sessions';

interface Props {
  session: SessionWithSite;
  onUpdated?: () => void;
}

export default function SessionCard({ session, onUpdated }: Props) {
  const isInProgress = session.end_time == null;
  const [now, setNow] = useState(() => new Date().toISOString());
  const [editing, setEditing] = useState(false);
  const [buyIn, setBuyIn] = useState(() => centsToDollars(session.buy_in_total).toFixed(2));
  const [cashOut, setCashOut] = useState(() => centsToDollars(session.cash_out_total).toFixed(2));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live timer for in-progress sessions
  useEffect(() => {
    if (!isInProgress) return;
    const t = setInterval(() => setNow(new Date().toISOString()), 1000);
    return () => clearInterval(t);
  }, [isInProgress]);

  const elapsedMinutes = isInProgress
    ? durationMinutes(session.start_time, now)
    : durationMinutes(session.start_time, session.end_time!);
  const isProfit = session.profit >= 0;

  const handleSaveEdit = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateSession(session.id, {
        buy_in_total: dollarsToCents(parseFloat(buyIn) || 0),
        cash_out_total: dollarsToCents(parseFloat(cashOut) || 0),
      });
      setEditing(false);
      onUpdated?.();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEndSession = async () => {
    setSaving(true);
    setError(null);
    try {
      const endTime = new Date().toISOString();
      await updateSession(session.id, {
        end_time: endTime,
        cash_out_total: session.cash_out_total, // keep current
      });
      onUpdated?.();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-primary';

  return (
    <NeonCard glowColor={isProfit ? 'green' : 'red'} className="matrix-card-hover">
      <div className="flex justify-between items-start">
        <div className="flex-1 mr-4 min-w-0">
          <h3 className="text-lg font-semibold text-text-primary">{session.site.name}</h3>
          <p className="text-sm text-text-secondary mt-0.5">
            {session.stakes_text} {session.game_type} &middot; {session.format}
          </p>
        </div>
        {!editing && (
          <span className={`text-xl font-bold shrink-0 ${isProfit ? 'text-profit' : 'text-loss'}`}>
            {formatProfit(session.profit)}
          </span>
        )}
      </div>

      {/* Timer: show elapsed time (live for in-progress) */}
      <div className="flex justify-between items-center mt-2 text-xs text-text-muted">
        <span>{formatDate(session.start_time)}</span>
        <span className={isInProgress ? 'text-primary font-medium' : ''}>
          {elapsedMinutes >= 0 && formatDuration(elapsedMinutes)}
          {isInProgress && <span className="ml-1 opacity-75">(live)</span>}
        </span>
      </div>

      {error && (
        <p className="mt-2 text-xs text-loss">{error}</p>
      )}

      {/* Edit form */}
      {editing ? (
        <div className="mt-4 pt-3 border-t border-border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Buy-in ($)</label>
              <input
                className={inputCls}
                type="number"
                step="0.01"
                min="0"
                value={buyIn}
                onChange={(e) => setBuyIn(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Cash-out ($)</label>
              <input
                className={inputCls}
                type="number"
                step="0.01"
                min="0"
                value={cashOut}
                onChange={(e) => setCashOut(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={saving}
              className="px-3 py-1.5 rounded-lg bg-primary text-text-inverse text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setError(null); }}
              className="px-3 py-1.5 rounded-lg border border-border text-text-secondary text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="px-3 py-1.5 rounded-lg border border-border text-text-secondary text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Edit buy-in / cash-out
          </button>
          {isInProgress && (
            <button
              type="button"
              onClick={handleEndSession}
              disabled={saving}
              className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary border border-primary/50 text-xs font-medium hover:bg-primary/30 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Ending...' : 'End session'}
            </button>
          )}
        </div>
      )}
    </NeonCard>
  );
}
