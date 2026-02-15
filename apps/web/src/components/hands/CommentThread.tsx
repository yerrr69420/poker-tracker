import { formatRelativeTime } from '@poker-tracker/shared';
import type { HandCommentWithAuthor } from '@poker-tracker/shared';

interface Props {
  comments: HandCommentWithAuthor[];
  depth?: number;
}

const STREET_COLORS: Record<string, string> = {
  preflop: 'text-warning bg-warning/10',
  flop: 'text-primary bg-primary/10',
  turn: 'text-profit bg-profit/10',
  river: 'text-loss bg-loss/10',
  showdown: 'text-purple-400 bg-purple-400/10',
};

export default function CommentThread({ comments, depth = 0 }: Props) {
  return (
    <div className={depth > 0 ? 'ml-6 border-l-2 border-border pl-4' : ''}>
      {comments.map((comment) => (
        <div key={comment.id} className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-primary">{comment.author_email}</span>
            {comment.street_anchor !== 'none' && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                  STREET_COLORS[comment.street_anchor] || 'text-primary bg-primary/10'
                }`}
              >
                {comment.street_anchor}
              </span>
            )}
            <span className="text-xs text-text-muted ml-auto">
              {formatRelativeTime(comment.created_at)}
            </span>
          </div>
          <p className="text-sm text-text-primary leading-relaxed">{comment.body}</p>

          {comment.replies && comment.replies.length > 0 && (
            <CommentThread comments={comment.replies} depth={depth + 1} />
          )}
        </div>
      ))}
    </div>
  );
}
