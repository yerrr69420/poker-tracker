'use client';

import { useState } from 'react';
import {
  formatCurrency, formatProfit, dollarsToCents,
} from '@poker-tracker/shared';
import { useBankroll } from '@/hooks/useBankroll';
import NeonCard from '@/components/ui/NeonCard';
import MascotHeader from '@/components/mascot/MascotHeader';
import BankrollSiteRow from '@/components/bankroll/BankrollSiteRow';
import BankrollChart from '@/components/bankroll/BankrollChart';

export default function BankrollPage() {
  const {
    loading, selectedDate, setSelectedDate,
    getSummary, getChartData, setManualOverride,
  } = useBankroll();

  const [overrideSiteId, setOverrideSiteId] = useState<string | null>(null);
  const [overrideValue, setOverrideValue] = useState('');
  const [overrideError, setOverrideError] = useState<string | null>(null);

  const summary = getSummary(selectedDate);
  const chartData = getChartData(14);
  const delta = summary.previousTotal !== null ? summary.total - summary.previousTotal : null;
  const mood = summary.total > 0 ? 'profit' : summary.total < 0 ? 'loss' : 'neutral';

  const handleDateChange = (direction: -1 | 1) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + direction);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleOverrideSave = async () => {
    if (!overrideSiteId || !overrideValue) return;
    setOverrideError(null);
    try {
      const cents = dollarsToCents(parseFloat(overrideValue));
      await setManualOverride(overrideSiteId, selectedDate, cents);
      setOverrideSiteId(null);
      setOverrideValue('');
    } catch (e: any) {
      setOverrideError(e.message);
    }
  };

  const inputCls = 'w-full bg-bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <MascotHeader title="Bankroll" subtitle={selectedDate} mood={mood} />

      {/* Date nav */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={() => handleDateChange(-1)}
          className="w-10 h-10 rounded-full bg-bg-card border border-border flex items-center justify-center text-text-primary text-xl hover:border-primary transition-colors"
        >
          &larr;
        </button>
        <span className="text-lg font-medium text-text-primary">{selectedDate}</span>
        <button
          onClick={() => handleDateChange(1)}
          className="w-10 h-10 rounded-full bg-bg-card border border-border flex items-center justify-center text-text-primary text-xl hover:border-primary transition-colors"
        >
          &rarr;
        </button>
      </div>

      {/* Total card */}
      <NeonCard
        glowColor={summary.total >= 0 ? 'green' : 'red'}
        pulse={summary.total !== 0}
        className="text-center"
      >
        <p className="text-sm text-text-secondary">Total Bankroll</p>
        <p className={`text-4xl font-extrabold mt-1 ${summary.total >= 0 ? 'text-profit' : 'text-loss'}`}>
          {formatCurrency(summary.total)}
        </p>
        {delta !== null && delta !== 0 && (
          <p className={`text-sm mt-1 ${delta >= 0 ? 'text-profit' : 'text-loss'}`}>
            {formatProfit(delta)} from yesterday
          </p>
        )}
      </NeonCard>

      {/* Chart */}
      <NeonCard>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
          14-Day Trend
        </h3>
        <BankrollChart data={chartData} height={120} />
      </NeonCard>

      {/* Per-site breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
          By Site
        </h3>
        {summary.sites.length === 0 && (
          <p className="text-text-muted text-center py-6">No bankroll data for this date.</p>
        )}
        {summary.sites.map((entry) => (
          <div
            key={entry.site.id}
            className="cursor-pointer"
            onClick={() => {
              setOverrideSiteId(entry.site.id);
              setOverrideValue((entry.amount / 100).toString());
            }}
          >
            <BankrollSiteRow entry={entry} />
          </div>
        ))}
      </div>

      {/* Manual override panel */}
      {overrideSiteId && (
        <NeonCard glowColor="cyan" className="space-y-4">
          <h3 className="text-md font-semibold text-primary">
            Manual Override &mdash; {summary.sites.find((s) => s.site.id === overrideSiteId)?.site.name}
          </h3>
          {overrideError && (
            <p className="text-loss text-sm">{overrideError}</p>
          )}
          <input
            className={inputCls}
            value={overrideValue}
            onChange={(e) => setOverrideValue(e.target.value)}
            type="number"
            step="0.01"
            placeholder="Amount in dollars"
          />
          <div className="flex gap-3">
            <button
              onClick={() => { setOverrideSiteId(null); setOverrideValue(''); }}
              className="flex-1 py-3 rounded-lg border border-border text-text-secondary font-medium hover:bg-bg-card transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleOverrideSave}
              className="flex-1 py-3 rounded-lg bg-primary text-text-inverse font-bold hover:opacity-90 transition-opacity"
            >
              Save Override
            </button>
          </div>
        </NeonCard>
      )}

      <p className="text-xs text-text-muted text-center">
        Click a site row to set a manual balance override for the selected date.
      </p>
    </div>
  );
}
