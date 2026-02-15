'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { fetchSites, createSite } from '@/lib/queries/sites';
import {
  dollarsToCents, GAME_TYPES,
} from '@poker-tracker/shared';
import type { GameTypeEnum, SessionFormat, SiteRow, SessionInsert, SiteType } from '@poker-tracker/shared';

export default function NewSessionPage() {
  const router = useRouter();
  const supabase = createClient();
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [siteId, setSiteId] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [gameType, setGameType] = useState<GameTypeEnum>('NLH');
  const [format, setFormat] = useState<SessionFormat>('cash');
  const [stakesText, setStakesText] = useState('');
  const [buyIn, setBuyIn] = useState('');
  const [cashOut, setCashOut] = useState('');
  const [sessionInProgress, setSessionInProgress] = useState(false);
  const [notes, setNotes] = useState('');
  // Other site
  const [showOtherSite, setShowOtherSite] = useState(false);
  const [otherSiteName, setOtherSiteName] = useState('');
  const [otherSiteType, setOtherSiteType] = useState<SiteType>('online');
  const [addingSite, setAddingSite] = useState(false);
  // Tournament
  const [tournamentName, setTournamentName] = useState('');
  const [finishPosition, setFinishPosition] = useState('');
  const [fieldSize, setFieldSize] = useState('');
  const [itm, setItm] = useState(false);
  const [rebuysCount, setRebuysCount] = useState('0');
  const [rebuyCost, setRebuyCost] = useState('');
  const [addonsCount, setAddonsCount] = useState('0');
  const [addonCost, setAddonCost] = useState('');

  useEffect(() => { fetchSites().then(setSites).catch(() => {}); }, []);

  const profitPreview = buyIn && cashOut && !sessionInProgress
    ? (parseFloat(cashOut) || 0) - (parseFloat(buyIn) || 0)
    : null;

  const handleAddOtherSite = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!otherSiteName.trim()) { setError('Enter a site name.'); return; }
    setAddingSite(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const newSite = await createSite({
        user_id: user.id,
        name: otherSiteName.trim(),
        type: otherSiteType,
        currency: 'USD',
        is_preset: false,
      });
      setSites((prev) => [...prev, newSite]);
      setSiteId(newSite.id);
      setIsLive(newSite.type === 'live');
      setShowOtherSite(false);
      setOtherSiteName('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAddingSite(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteId) { setError('Please select a site.'); return; }
    if (!buyIn) { setError('Please enter a buy-in.'); return; }

    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const now = new Date().toISOString();
      const session: SessionInsert = {
        user_id: user.id,
        site_id: siteId,
        is_live: isLive,
        game_type: gameType,
        format,
        stakes_text: stakesText,
        start_time: now,
        end_time: sessionInProgress ? null : now,
        buy_in_total: dollarsToCents(parseFloat(buyIn) || 0),
        cash_out_total: sessionInProgress ? 0 : dollarsToCents(parseFloat(cashOut) || 0),
        notes: notes || null,
        tournament_name: format === 'tournament' ? (tournamentName || null) : null,
        finish_position: format === 'tournament' ? (parseInt(finishPosition) || null) : null,
        field_size: format === 'tournament' ? (parseInt(fieldSize) || null) : null,
        itm: format === 'tournament' ? itm : null,
        rebuys_count: parseInt(rebuysCount) || 0,
        rebuy_cost: dollarsToCents(parseFloat(rebuyCost) || 0),
        addons_count: parseInt(addonsCount) || 0,
        addon_cost: dollarsToCents(parseFloat(addonCost) || 0),
        prize_pool: null,
      };

      const { error: insertErr } = await supabase.from('sessions').insert(session);
      if (insertErr) throw insertErr;
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-bg-card border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary matrix-hover';
  const labelCls = 'block text-sm text-text-secondary mb-1 mt-4';

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Add Session</h1>

      {error && (
        <div className="border border-loss bg-loss/10 rounded-lg p-4 text-loss text-sm mb-4">
          <div className="font-bold mb-1">⚠️ Error</div>
          <div className="mb-2">{error}</div>
          {(error.includes('sessions') || error.includes('schema cache')) && (
            <div className="mt-2 p-2 bg-black/30 rounded border border-loss/30 text-xs space-y-1">
              <strong>Fix:</strong> In Supabase Dashboard → SQL Editor, run the script <code className="bg-black/50 px-1 rounded">RUN_ALL_FIXES.sql</code> (in your poker-tracker folder). It creates the <code className="bg-black/50 px-1 rounded">sessions</code> and <code className="bg-black/50 px-1 rounded">sites</code> tables. Then refresh this page.
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        {/* Site picker */}
        <label className={labelCls}>Site / Room</label>
        <div className="flex flex-wrap gap-2">
          {sites.map((site) => (
            <button
              key={site.id}
              type="button"
              onClick={() => { setSiteId(site.id); setIsLive(site.type === 'live'); }}
              className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all cursor-pointer select-none matrix-hover ${
                siteId === site.id
                  ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/50 shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                  : 'border-border bg-bg-card text-text-secondary'
              }`}
            >
              {site.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowOtherSite((v) => !v)}
              className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all cursor-pointer select-none matrix-hover ${
                showOtherSite ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(0,229,255,0.3)]' : 'border-border bg-bg-card text-text-secondary'
              }`}
          >
            + Other
          </button>
        </div>
        {showOtherSite && (
          <div className="mt-3 p-3 rounded-lg border border-border bg-bg-card space-y-2">
            <input
              className={inputCls}
              placeholder="Site or room name"
              value={otherSiteName}
              onChange={(e) => setOtherSiteName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddOtherSite(e as any);
                }
              }}
              autoFocus
            />
            <div className="flex gap-2">
              {(['online', 'live'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setOtherSiteType(t)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium capitalize cursor-pointer transition-all hover:shadow-[0_0_12px_rgba(0,255,135,0.3)] ${
                    otherSiteType === t ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(0,229,255,0.4)]' : 'border-border text-text-secondary hover:border-primary/50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={handleAddOtherSite} disabled={addingSite} className="px-4 py-2 rounded-lg bg-primary text-text-inverse text-sm font-medium disabled:opacity-50 hover:shadow-[0_0_16px_rgba(0,229,255,0.5)] transition-all">
                {addingSite ? 'Adding...' : 'Add & Select'}
              </button>
              <button type="button" onClick={() => { setShowOtherSite(false); setOtherSiteName(''); }} className="px-4 py-2 rounded-lg border border-border text-text-secondary text-sm hover:border-primary/50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Game type */}
        <label className={labelCls}>Game Type</label>
        <div className="flex flex-wrap gap-2">
          {GAME_TYPES.map((gt) => (
            <button
              key={gt.value}
              type="button"
              onClick={() => setGameType(gt.value)}
              className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                gameType === gt.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-bg-card text-text-secondary hover:border-border-light'
              }`}
            >
              {gt.label}
            </button>
          ))}
        </div>

        {/* Format */}
        <label className={labelCls}>Format</label>
        <div className="grid grid-cols-2 gap-3">
          {(['cash', 'tournament'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFormat(f)}
              className={`py-3 rounded-lg border text-sm font-medium transition-all capitalize cursor-pointer select-none matrix-hover ${
                format === f
                  ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/50 shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                  : 'border-border bg-bg-card text-text-secondary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Stakes */}
        <label className={labelCls}>Stakes</label>
        <input
          className={inputCls}
          placeholder={format === 'cash' ? '1/2' : '$55 MTT'}
          value={stakesText}
          onChange={(e) => setStakesText(e.target.value)}
        />

        {/* Buy-in / Cash-out */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Buy-in ($)</label>
            <input className={inputCls} placeholder="0.00" value={buyIn} onChange={(e) => setBuyIn(e.target.value)} type="number" step="0.01" min="0" />
          </div>
          <div>
            <label className={labelCls}>Cash-out ($)</label>
            <input className={`${inputCls} ${sessionInProgress ? 'opacity-50' : ''}`} placeholder="0.00 or leave blank" value={cashOut} onChange={(e) => setCashOut(e.target.value)} type="number" step="0.01" min="0" disabled={sessionInProgress} />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={() => setSessionInProgress((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium cursor-pointer select-none transition-colors ${
              sessionInProgress ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-secondary hover:border-primary/50'
            }`}
          >
            <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${sessionInProgress ? 'border-primary bg-primary' : 'border-border'}`}>
              {sessionInProgress && <span className="text-white text-xs">✓</span>}
            </span>
            Session in progress (I&apos;ll add result later)
          </button>
        </div>

        {profitPreview !== null && (
          <p className={`text-center text-lg font-bold mt-2 ${profitPreview >= 0 ? 'text-profit' : 'text-loss'}`}>
            Profit: {profitPreview >= 0 ? '+' : ''}${profitPreview.toFixed(2)}
          </p>
        )}

        {/* Tournament fields */}
        {format === 'tournament' && (
          <div className="border-t border-border pt-4 mt-4 space-y-2">
            <h3 className="text-lg font-semibold text-primary">Tournament Details</h3>

            <label className={labelCls}>Tournament Name</label>
            <input className={inputCls} placeholder="Sunday Million" value={tournamentName} onChange={(e) => setTournamentName(e.target.value)} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Finish Position</label>
                <input className={inputCls} placeholder="1" value={finishPosition} onChange={(e) => setFinishPosition(e.target.value)} type="number" min="1" />
              </div>
              <div>
                <label className={labelCls}>Field Size</label>
                <input className={inputCls} placeholder="1000" value={fieldSize} onChange={(e) => setFieldSize(e.target.value)} type="number" min="1" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <label className="text-sm text-text-secondary">In the money?</label>
              <button type="button" onClick={() => setItm(!itm)} className={`w-12 h-6 rounded-full transition-colors ${itm ? 'bg-profit' : 'bg-border'}`}>
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${itm ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Rebuys</label>
                <input className={inputCls} value={rebuysCount} onChange={(e) => setRebuysCount(e.target.value)} type="number" min="0" />
              </div>
              <div>
                <label className={labelCls}>Rebuy Cost ($)</label>
                <input className={inputCls} placeholder="0.00" value={rebuyCost} onChange={(e) => setRebuyCost(e.target.value)} type="number" step="0.01" min="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Add-ons</label>
                <input className={inputCls} value={addonsCount} onChange={(e) => setAddonsCount(e.target.value)} type="number" min="0" />
              </div>
              <div>
                <label className={labelCls}>Add-on Cost ($)</label>
                <input className={inputCls} placeholder="0.00" value={addonCost} onChange={(e) => setAddonCost(e.target.value)} type="number" step="0.01" min="0" />
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <label className={labelCls}>Notes</label>
        <textarea className={`${inputCls} min-h-[80px]`} placeholder="Session notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 rounded-lg border border-border text-text-secondary font-medium hover:bg-bg-card transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] py-3 rounded-lg bg-primary text-text-inverse font-bold hover:opacity-90 transition-all disabled:opacity-50 hover:shadow-[0_0_20px_rgba(0,229,255,0.5)] matrix-hover"
          >
            {loading ? 'Saving...' : 'Save Session'}
          </button>
        </div>
      </form>
    </div>
  );
}
