'use client';

import Link from 'next/link';
import { formatRelativeTime, parseCards } from '@poker-tracker/shared';
import type { HandPostWithAuthor } from '@poker-tracker/shared';
import NeonCard from '../ui/NeonCard';
import HoleCards from '../cards/HoleCards';

interface Props {
  post: HandPostWithAuthor;
}

export default function HandCard({ post }: Props) {
  const heroCards = post.hero_hand ? parseCards(post.hero_hand) : [];

  return (
    <Link href={`/hands/${post.id}`} className="block">
      <NeonCard className="hover:border-primary/40 transition-colors">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-text-primary truncate">{post.title}</h3>
            <p className="text-xs text-text-secondary mt-1">
              {post.game_type && `${post.game_type} · `}
              {post.stakes_text && `${post.stakes_text} · `}
              {post.post_anonymous ? 'Anonymous' : post.author_email || 'User'}
            </p>
          </div>
          {heroCards.length > 0 && <HoleCards cards={heroCards} size="sm" animate={false} />}
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-xs text-primary bg-primary/10"
              >
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-text-muted self-center">+{post.tags.length - 3}</span>
            )}
          </div>
        )}

        <div className="flex justify-between mt-2 text-xs text-text-muted">
          <span>{post.comment_count} comment{post.comment_count !== 1 ? 's' : ''}</span>
          <span>{formatRelativeTime(post.created_at)}</span>
        </div>
      </NeonCard>
    </Link>
  );
}
