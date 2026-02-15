import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import {
  colors, spacing, fontSizes, fontWeights, borderRadius,
  formatRelativeTime, parseCards,
} from '@poker-tracker/shared';
import type { StreetEnum } from '@poker-tracker/shared';
import { useHandPostDetail } from '../../hooks/useHandFeed';
import NeonCard from '../../components/ui/NeonCard';
import TableFeltBg from '../../components/ui/TableFeltBg';
import HoleCards from '../../components/cards/HoleCards';
import BoardCards from '../../components/cards/BoardCards';
import CommentThread from '../../components/hands/CommentThread';

const STREETS: { label: string; value: StreetEnum }[] = [
  { label: 'General', value: 'none' },
  { label: 'Preflop', value: 'preflop' },
  { label: 'Flop', value: 'flop' },
  { label: 'Turn', value: 'turn' },
  { label: 'River', value: 'river' },
];

interface Props {
  postId: string;
  onBack: () => void;
}

export default function HandPostDetailScreen({ postId, onBack }: Props) {
  const { post, comments, loading, addComment } = useHandPostDetail(postId);
  const [commentBody, setCommentBody] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [streetAnchor, setStreetAnchor] = useState<StreetEnum>('none');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitComment = async () => {
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
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const heroCards = post.hero_hand ? parseCards(post.hero_hand) : [];
  const boardCards = post.board ? parseCards(post.board) : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Back */}
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backText}>&larr; Back</Text>
      </TouchableOpacity>

      {/* Title & meta */}
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.meta}>
        {post.post_anonymous ? 'Anonymous' : post.author_email || 'User'}
        {' · '}
        {post.game_type && `${post.game_type} · `}
        {post.stakes_text && `${post.stakes_text} · `}
        {formatRelativeTime(post.created_at)}
      </Text>

      {/* Tags */}
      {post.tags.length > 0 && (
        <View style={styles.tagRow}>
          {post.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Card display on felt */}
      {(heroCards.length > 0 || boardCards.length > 0) && (
        <TableFeltBg style={styles.feltPanel}>
          <View style={styles.feltContent}>
            {heroCards.length > 0 && (
              <View style={styles.cardSection}>
                <Text style={styles.cardLabel}>Hero</Text>
                <HoleCards cards={heroCards} size="lg" />
              </View>
            )}
            {boardCards.length > 0 && (
              <View style={styles.cardSection}>
                <Text style={styles.cardLabel}>Board</Text>
                <BoardCards cards={boardCards} size="md" />
              </View>
            )}
          </View>
        </TableFeltBg>
      )}

      {/* Hand history text */}
      {post.hh_raw_text && (
        <NeonCard style={styles.hhCard}>
          <Text style={styles.hhLabel}>Hand History</Text>
          <Text style={styles.hhText}>{post.hh_raw_text}</Text>
        </NeonCard>
      )}

      {/* Comments */}
      <Text style={styles.sectionTitle}>
        Comments ({post.comment_count})
      </Text>

      {comments.length > 0 ? (
        <CommentThread comments={comments} />
      ) : (
        <Text style={styles.emptyComments}>No comments yet. Start the discussion!</Text>
      )}

      {/* Add comment form */}
      <NeonCard style={styles.commentForm}>
        {replyTo && (
          <View style={styles.replyIndicator}>
            <Text style={styles.replyText}>Replying to comment</Text>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <Text style={styles.cancelReply}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Street anchor picker */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.streetRow}>
          {STREETS.map((s) => (
            <TouchableOpacity
              key={s.value}
              onPress={() => setStreetAnchor(s.value)}
              style={[styles.streetChip, streetAnchor === s.value && styles.streetChipActive]}
            >
              <Text style={[styles.streetChipText, streetAnchor === s.value && styles.streetChipTextActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TextInput
          style={styles.commentInput}
          placeholder="Share your thoughts..."
          placeholderTextColor={colors.textMuted}
          value={commentBody}
          onChangeText={setCommentBody}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.5 }]}
          onPress={handleSubmitComment}
          disabled={submitting || !commentBody.trim()}
        >
          {submitting ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.submitText}>Post Comment</Text>
          )}
        </TouchableOpacity>
      </NeonCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDeep },
  content: { padding: spacing.lg, paddingBottom: spacing['4xl'] },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bgDeep },
  backBtn: { marginBottom: spacing.md },
  backText: { color: colors.primary, fontSize: fontSizes.md, fontWeight: fontWeights.medium },
  title: { color: colors.textPrimary, fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold },
  meta: { color: colors.textSecondary, fontSize: fontSizes.sm, marginTop: spacing.xs },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  tag: { backgroundColor: colors.primary + '20', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 999 },
  tagText: { color: colors.primary, fontSize: fontSizes.xs },
  feltPanel: { marginTop: spacing.lg, padding: spacing.lg },
  feltContent: { gap: spacing.lg, alignItems: 'center' },
  cardSection: { alignItems: 'center', gap: spacing.sm },
  cardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: fontSizes.sm, fontWeight: fontWeights.semibold },
  hhCard: { marginTop: spacing.lg },
  hhLabel: { color: colors.textSecondary, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, marginBottom: spacing.sm },
  hhText: { color: colors.textPrimary, fontSize: fontSizes.sm, fontFamily: 'monospace', lineHeight: 20 },
  sectionTitle: {
    color: colors.textSecondary, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold,
    textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.xl, marginBottom: spacing.md,
  },
  emptyComments: { color: colors.textMuted, fontSize: fontSizes.md, textAlign: 'center', paddingVertical: spacing.lg },
  commentForm: { marginTop: spacing.lg },
  replyIndicator: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.sm, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  replyText: { color: colors.textSecondary, fontSize: fontSizes.sm },
  cancelReply: { color: colors.loss, fontSize: fontSizes.sm, fontWeight: fontWeights.medium },
  streetRow: { marginBottom: spacing.sm },
  streetChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 999,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgSurface, marginRight: spacing.sm,
  },
  streetChipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '20' },
  streetChipText: { color: colors.textSecondary, fontSize: fontSizes.xs },
  streetChipTextActive: { color: colors.primary },
  commentInput: {
    backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.border,
    borderRadius: borderRadius.md, padding: spacing.md, color: colors.textPrimary,
    fontSize: fontSizes.md, minHeight: 80, textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: spacing.sm, backgroundColor: colors.primary, borderRadius: borderRadius.md,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  submitText: { color: colors.textInverse, fontWeight: fontWeights.bold, fontSize: fontSizes.md },
});
