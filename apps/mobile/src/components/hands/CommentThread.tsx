import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes, fontWeights, borderRadius, formatRelativeTime } from '@poker-tracker/shared';
import type { HandCommentWithAuthor } from '@poker-tracker/shared';

interface Props {
  comments: HandCommentWithAuthor[];
  depth?: number;
}

const STREET_COLORS: Record<string, string> = {
  preflop: '#ffab00',
  flop: '#00e5ff',
  turn: '#00ff87',
  river: '#ff1744',
  showdown: '#9c27b0',
};

export default function CommentThread({ comments, depth = 0 }: Props) {
  return (
    <View style={depth > 0 ? styles.nested : undefined}>
      {comments.map((comment) => (
        <View key={comment.id} style={styles.commentRow}>
          <View style={styles.header}>
            <Text style={styles.author}>{comment.author_email}</Text>
            {comment.street_anchor !== 'none' && (
              <View
                style={[
                  styles.streetBadge,
                  { backgroundColor: (STREET_COLORS[comment.street_anchor] || colors.primary) + '25' },
                ]}
              >
                <Text
                  style={[
                    styles.streetText,
                    { color: STREET_COLORS[comment.street_anchor] || colors.primary },
                  ]}
                >
                  {comment.street_anchor}
                </Text>
              </View>
            )}
            <Text style={styles.time}>{formatRelativeTime(comment.created_at)}</Text>
          </View>
          <Text style={styles.body}>{comment.body}</Text>

          {comment.replies && comment.replies.length > 0 && (
            <CommentThread comments={comment.replies} depth={depth + 1} />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  nested: {
    marginLeft: spacing.lg,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
    paddingLeft: spacing.md,
  },
  commentRow: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  author: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
  streetBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
  },
  streetText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    textTransform: 'capitalize',
  },
  time: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    marginLeft: 'auto',
  },
  body: {
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    lineHeight: 20,
  },
});
