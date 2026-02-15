'use client';

import Link from 'next/link';
import { HAND_TAGS } from '@poker-tracker/shared';
import type { HandFeedTab } from '@poker-tracker/shared';
import { useHandFeed } from '@/hooks/useHandFeed';
import HandCard from '@/components/hands/HandCard';
import FilterChips from '@/components/hands/FilterChips';
import MascotHeader from '@/components/mascot/MascotHeader';

const TABS: { label: string; value: HandFeedTab }[] = [
  { label: 'Latest', value: 'latest' },
  { label: 'Unanswered', value: 'unanswered' },
  { label: 'My Posts', value: 'my_posts' },
];

const TAG_OPTIONS = HAND_TAGS.slice(0, 12).map((t) => ({ label: t, value: t }));

export default function HandFeedPage() {
  const { posts, loading, filters, setTab, toggleTag } = useHandFeed();

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <MascotHeader title="Hand Reviews" subtitle="Discuss hands with the community" />

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setTab(tab.value)}
            className={`py-2 rounded-lg border text-sm font-medium transition-all matrix-hover ${
              filters.tab === tab.value
                ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                : 'border-border bg-bg-card text-text-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tag filters */}
      <FilterChips
        options={TAG_OPTIONS}
        selected={filters.tags || []}
        onToggle={toggleTag}
      />

      {/* Create button */}
      <Link
        href="/hands/new"
        className="block text-center bg-primary text-text-inverse font-bold py-3 rounded-xl hover:opacity-90 transition-all hover:shadow-[0_0_24px_rgba(0,229,255,0.5)] matrix-hover"
      >
        🃏 + Quick Hand Log
      </Link>

      {/* Posts */}
      <div className="space-y-3">
        {posts.map((post) => (
          <HandCard key={post.id} post={post} />
        ))}
      </div>

      {!loading && posts.length === 0 && (
        <p className="text-text-muted text-center py-8">No hand posts yet. Be the first!</p>
      )}
    </div>
  );
}
