'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { createHandPost } from '@/lib/queries/hands';
import { GAME_TYPES, HAND_TAGS } from '@poker-tracker/shared';
import type { GameTypeEnum, SessionFormat, PostVisibility, HandPostInsert } from '@poker-tracker/shared';

export default function NewHandPostPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState('');
  const [hhRawText, setHhRawText] = useState('');
  const [heroHand, setHeroHand] = useState('');
  const [board, setBoard] = useState('');
  const [stakesText, setStakesText] = useState('');
  const [gameType, setGameType] = useState<GameTypeEnum | null>(null);
  const [format, setFormat] = useState<SessionFormat | null>(null);
  const [siteName, setSiteName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<PostVisibility>('public');
  const [postAnonymous, setPostAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required.'); return; }

    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const post: HandPostInsert = {
        user_id: user.id,
        title: title.trim(),
        hh_raw_text: hhRawText || null,
        hero_hand: heroHand || null,
        board: board || null,
        stakes_text: stakesText || null,
        game_type: gameType,
        format,
        is_live: null,
        site_name: siteName || null,
        tags: selectedTags,
        visibility,
        post_anonymous: postAnonymous,
      };

      await createHandPost(post);
      router.push('/hands');
    } catch (err: any) {
      // Better error messages
      let errorMessage = err.message || 'Failed to post hand';
      
      if (err.message?.includes('hand_posts') || err.message?.includes('schema cache')) {
        errorMessage = 'Database table not found. Please run the migration SQL in Supabase Dashboard → SQL Editor. See supabase/migrations/20240213060000_create_hand_posts.sql';
      } else if (err.message?.includes('permission') || err.message?.includes('policy')) {
        errorMessage = 'Permission denied. Please check your Supabase RLS policies.';
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errorMessage = 'Network error. Check your connection and Supabase project status.';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-bg-card border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary matrix-hover';
  const labelCls = 'block text-sm text-text-secondary mb-2 font-medium';
  const cardCls = 'bg-bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 card-edge matrix-hover relative z-10';

  return (
    <div className="max-w-4xl mx-auto space-y-6 chip-accent rounded-2xl pt-4 pb-6 px-4 relative z-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Quick Hand Log</h1>
        <span className="text-xs text-text-muted px-3 py-1 rounded-full border border-border bg-bg-card">
          🃏 Fast Entry
        </span>
      </div>

      {error && (
        <div className="border border-loss bg-loss/10 rounded-lg p-4 text-loss text-sm matrix-glow relative z-20">
          <div className="font-bold mb-2">⚠️ Database Error</div>
          <div className="text-xs opacity-90 mb-3">{error}</div>
          {(error.includes('migration') || error.includes('hand_posts') || error.includes('schema cache')) && (
            <div className="mt-3 p-3 bg-black/30 rounded border border-loss/30">
              <div className="font-semibold mb-2 text-xs">🔧 Quick Fix:</div>
              <ol className="text-xs space-y-1.5 list-decimal list-inside opacity-90">
                <li>Open <strong>Supabase Dashboard</strong> → Your Project</li>
                <li>Go to <strong>SQL Editor</strong> (left sidebar)</li>
                <li>Click <strong>New Query</strong></li>
                <li>Open the file: <code className="bg-black/50 px-1.5 py-0.5 rounded">FIX_HAND_POSTS.sql</code> in the project root</li>
                <li>Copy ALL the SQL code</li>
                <li>Paste into SQL Editor and click <strong>RUN</strong></li>
                <li>Refresh this page and try again!</li>
              </ol>
              <div className="mt-2 pt-2 border-t border-loss/20 text-xs opacity-75">
                📁 File location: <code className="bg-black/50 px-1.5 py-0.5 rounded">poker-tracker/FIX_HAND_POSTS.sql</code>
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quick Info Card */}
        <div className={cardCls}>
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <span className="text-2xl">🃏</span>
            Hand Details
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Title *</label>
              <input
                className={inputCls}
                placeholder="e.g. Tough river spot with top pair"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Hero Hand</label>
                <input 
                  className={inputCls} 
                  placeholder="AhKs" 
                  value={heroHand} 
                  onChange={(e) => setHeroHand(e.target.value)} 
                />
              </div>
              <div>
                <label className={labelCls}>Board</label>
                <input 
                  className={inputCls} 
                  placeholder="Ah Kd 7c 2s 9h" 
                  value={board} 
                  onChange={(e) => setBoard(e.target.value)} 
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Stakes</label>
                <input 
                  className={inputCls} 
                  placeholder="1/2" 
                  value={stakesText} 
                  onChange={(e) => setStakesText(e.target.value)} 
                />
              </div>
              <div>
                <label className={labelCls}>Site</label>
                <input 
                  className={inputCls} 
                  placeholder="PokerStars" 
                  value={siteName} 
                  onChange={(e) => setSiteName(e.target.value)} 
                />
              </div>
              <div>
                <label className={labelCls}>Format</label>
                <div className="flex gap-2">
                  {(['cash', 'tournament'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormat(format === f ? null : f)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all capitalize matrix-hover ${
                        format === f
                          ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                          : 'border-border bg-bg-card text-text-secondary'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Type Card */}
        <div className={cardCls}>
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <span className="text-2xl">♠</span>
            Game Type
          </h2>
          <div className="flex flex-wrap gap-2">
            {GAME_TYPES.map((gt) => (
              <button
                key={gt.value}
                type="button"
                onClick={() => setGameType(gameType === gt.value ? null : gt.value)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all matrix-hover ${
                  gameType === gt.value
                    ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                    : 'border-border bg-bg-card text-text-secondary'
                }`}
              >
                {gt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hand History Card */}
        <div className={cardCls}>
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <span className="text-2xl">📝</span>
            Hand History (Optional)
          </h2>
          <textarea
            className={`${inputCls} min-h-[120px] font-mono text-sm`}
            placeholder="Paste hand history here or type the action..."
            value={hhRawText}
            onChange={(e) => setHhRawText(e.target.value)}
          />
        </div>

        {/* Tags Card */}
        <div className={cardCls}>
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <span className="text-2xl">🏷️</span>
            Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {HAND_TAGS.slice(0, 16).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all matrix-hover ${
                  selectedTags.includes(tag)
                    ? 'border-primary bg-primary/10 text-primary shadow-[0_0_8px_rgba(0,229,255,0.3)]'
                    : 'border-border bg-bg-card text-text-secondary'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy Card */}
        <div className={cardCls}>
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <span className="text-2xl">🔒</span>
            Privacy
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-text-secondary">Private post (only you can see)</label>
              <button
                type="button"
                onClick={() => setVisibility(visibility === 'private' ? 'public' : 'private')}
                className={`w-12 h-6 rounded-full transition-all matrix-hover ${visibility === 'private' ? 'bg-primary shadow-[0_0_12px_rgba(0,229,255,0.4)]' : 'bg-border'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${visibility === 'private' ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-text-secondary">Post anonymously</label>
              <button
                type="button"
                onClick={() => setPostAnonymous(!postAnonymous)}
                className={`w-12 h-6 rounded-full transition-all matrix-hover ${postAnonymous ? 'bg-primary shadow-[0_0_12px_rgba(0,229,255,0.4)]' : 'bg-border'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${postAnonymous ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 rounded-lg border border-border text-text-secondary font-medium hover:bg-bg-card transition-all matrix-hover"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] py-3 rounded-lg bg-primary text-text-inverse font-bold hover:opacity-90 transition-all disabled:opacity-50 hover:shadow-[0_0_24px_rgba(0,229,255,0.6)] matrix-hover"
          >
            {loading ? 'Posting...' : '🃏 Post Hand'}
          </button>
        </div>
      </form>
    </div>
  );
}
