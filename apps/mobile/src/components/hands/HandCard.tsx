import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSizes, fontWeights, borderRadius, formatRelativeTime, parseCards } from '@poker-tracker/shared';
import type { HandPostWithAuthor } from '@poker-tracker/shared';
import NeonCard from '../ui/NeonCard';
import HoleCards from '../cards/HoleCards';

interface Props {
  post: HandPostWithAuthor;
  onPress: () => void;
}

function HandCard({ post, onPress }: Props) {
  const heroCards = post.hero_hand ? parseCards(post.hero_hand) : [];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <NeonCard style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.leftCol}>
            <Text style={styles.title} numberOfLines={2}>{post.title}</Text>
            <Text style={styles.meta}>
              {post.game_type && `${post.game_type} · `}
              {post.stakes_text && `${post.stakes_text} · `}
              {post.post_anonymous ? 'Anonymous' : post.author_email || 'User'}
            </Text>
          </View>
          {heroCards.length > 0 && <HoleCards cards={heroCards} size="sm" animate={false} />}
        </View>

        {post.tags.length > 0 && (
          <View style={styles.tagRow}>
            {post.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {post.tags.length > 3 && (
              <Text style={styles.moreTag}>+{post.tags.length - 3}</Text>
            )}
          </View>
        )}

        <View style={styles.bottomRow}>
          <Text style={styles.commentCount}>
            {post.comment_count} comment{post.comment_count !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.time}>{formatRelativeTime(post.created_at)}</Text>
        </View>
      </NeonCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  leftCol: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: fontSizes.xs,
    marginTop: 4,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tag: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  tagText: {
    color: colors.primary,
    fontSize: fontSizes.xs,
  },
  moreTag: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    alignSelf: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  commentCount: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
  },
  time: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
  },
});

export default React.memo(HandCard);
