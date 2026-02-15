'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  formatRelativeTime, parseCards,
} from '@poker-tracker/shared';
import type { StreetEnum } from '@poker-tracker/shared';
import { useHandPostDetail } from '@/hooks/useHandFeed';
import NeonCard from '@/components/ui/NeonCard';
import TableFeltBg from '@/components/ui/TableFeltBg';
import HoleCards from '@/components/cards/HoleCards';
import BoardCards from '@/components/cards/BoardCards';
import CommentThread from '@/components/hands/CommentThread';

const STREETS: { label: string; value: StreetEnum }[] = [
  { label: 'General', value: 'none' },
  { label: 'Preflop', value: 'preflop' },
  { label: 'Flop', value: 'flop' },
  { label: 'Turn', value: 'turn' },
  { label: 'River', value: 'river' },
];

export default function HandPostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { post, comments, loading, addComment } = useHandPostDetail(id);

  const [commentBody, setCommentBody] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [streetAnchor, setStreetAnchor] = useState<StreetEnum>('none');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setSubmitting(true);
    try {
      await addComment({
        body: commentBody.trim(),
        parent_comment_id: replyTo,
        street_anchor: streetAnchor,
      });
      setCommentBody('');
      setReplyTo(null);
      setStreetAnchor('none');
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !post) {
    return <div className="text-text-muted text-center py-12">Loading...</div>;
  }

  const heroCards = post.hero_hand ? parseCards(post.hero_hand) : [];
  const boardCards = post.board ? parseCards(post.board) : [];

  const inputCls = 'w-full bg-bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/hands" className="text-primary text-sm font-medium hover:underline">
        &larr; Back to feed
      </Link>

      {/* Title & meta */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{post.title}</h1>
        <p className="text-sm text-text-secondary mt-1">
          {post.post_anonymous ? 'Anonymous' : post.author_email || 'User'}
          {' · '}
          {post.game_type && `${post.game_type} · `}
          {post.stakes_text && `${post.stakes_text} · `}
          {formatRelativeTime(post.created_at)}
        </p>
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs text-primary bg-primary/10">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Cards on felt */}
      {(heroCards.length > 0 || boardCards.length > 0) && (
        <TableFeltBg className="p-6">
          <div className="flex flex-col items-center gap-6">
            {heroCards.length > 0 && (
              <div className="text-center">
                <p className="text-white/70 text-sm font-semibold mb-2">Hero</p>
                <HoleCards cards={heroCards} size="lg" />
              </div>
            )}
            {boardCards.length > 0 && (
              <div className="text-center">
                <p className="text-white/70 text-sm font-semibold mb-2">Board</p>
                <BoardCards cards={boardCards} size="md" />
              </div>
            )}
          </div>
        </TableFeltBg>
      )}

      {/* HH raw text */}
      {post.hh_raw_text && (
        <NeonCard>
          <h3 className="text-sm font-semibold text-text-secondary mb-2">Hand History</h3>
          <pre className="text-sm text-text-primary font-mono whitespace-pre-wrap leading-relaxed">
            {post.hh_raw_text}
          </pre>
        </NeonCard>
      )}

      {/* Comments section */}
      <div>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
          Comments ({post.comment_count})
        </h3>

        {comments.length > 0 ? (
          <CommentThread comments={comments} />
        ) : (
          <p className="text-text-muted text-center py-6">No comments yet. Start the discussion!</p>
        )}
      </div>

      {/* Add comment form */}
      <NeonCard>
        <form onSubmit={handleSubmitComment} className="space-y-3">
          {replyTo && (
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-sm text-text-secondary">Replying to comment</span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-sm text-loss hover:underline"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Street anchor picker */}
          <div className="flex gap-2 overflow-x-auto">
            {STREETS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStreetAnchor(s.value)}
                className={`whitespace-nowrap px-3 py-1 rounded-full border text-xs font-medium transition-colors ${
                  streetAnchor === s.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-bg-surface text-text-secondary'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <textarea
            className={`${inputCls} min-h-[80px]`}
            placeholder="Share your thoughts..."
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
          />

          <button
            type="submit"
            disabled={submitting || !commentBody.trim()}
            className="w-full py-3 rounded-lg bg-primary text-text-inverse font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      </NeonCard>
    </div>
  );
}
