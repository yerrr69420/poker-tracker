import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Switch, ActivityIndicator, Alert,
} from 'react-native';
import {
  colors, spacing, fontSizes, fontWeights, borderRadius,
  GAME_TYPES, HAND_TAGS,
} from '@poker-tracker/shared';
import type { GameTypeEnum, SessionFormat, PostVisibility, HandPostInsert } from '@poker-tracker/shared';
import { supabase } from '../../lib/supabase';
import { createHandPost } from '../../lib/queries/hands';

interface Props {
  onCreated: () => void;
  onCancel: () => void;
}

export default function CreateHandPostScreen({ onCreated, onCancel }: Props) {
  const [title, setTitle] = useState('');
  const [hhRawText, setHhRawText] = useState('');
  const [heroHand, setHeroHand] = useState('');
  const [board, setBoard] = useState('');
  const [stakesText, setStakesText] = useState('');
  const [gameType, setGameType] = useState<GameTypeEnum | null>(null);
  const [format, setFormat] = useState<SessionFormat | null>(null);
  const [isLive, setIsLive] = useState<boolean | null>(null);
  const [siteName, setSiteName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<PostVisibility>('public');
  const [postAnonymous, setPostAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Error', 'Title is required.'); return; }

    setLoading(true);
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
        is_live: isLive,
        site_name: siteName || null,
        tags: selectedTags,
        visibility,
        post_anonymous: postAnonymous,
      };

      await createHandPost(post);
      onCreated();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>New Hand Post</Text>

      {/* Title */}
      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Tough river spot with top pair"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
      />

      {/* Hand history text */}
      <Text style={styles.label}>Hand History (paste or type)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Paste hand history here..."
        placeholderTextColor={colors.textMuted}
        value={hhRawText}
        onChangeText={setHhRawText}
        multiline
        numberOfLines={6}
      />

      {/* Hero hand & board (manual entry) */}
      <Text style={styles.label}>Hero Hand (e.g. AhKs)</Text>
      <TextInput
        style={styles.input}
        placeholder="AhKs"
        placeholderTextColor={colors.textMuted}
        value={heroHand}
        onChangeText={setHeroHand}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Board (e.g. Ah Kd 7c 2s 9h)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ah Kd 7c"
        placeholderTextColor={colors.textMuted}
        value={board}
        onChangeText={setBoard}
        autoCapitalize="none"
      />

      {/* Game info */}
      <Text style={styles.label}>Stakes</Text>
      <TextInput
        style={styles.input}
        placeholder="1/2"
        placeholderTextColor={colors.textMuted}
        value={stakesText}
        onChangeText={setStakesText}
      />

      <Text style={styles.label}>Game Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {GAME_TYPES.map((gt) => (
          <TouchableOpacity
            key={gt.value}
            onPress={() => setGameType(gameType === gt.value ? null : gt.value)}
            style={[styles.chip, gameType === gt.value && styles.chipActive]}
          >
            <Text style={[styles.chipText, gameType === gt.value && styles.chipTextActive]}>
              {gt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Format</Text>
      <View style={styles.toggleRow}>
        {(['cash', 'tournament'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFormat(format === f ? null : f)}
            style={[styles.toggleBtn, format === f && styles.toggleActive]}
          >
            <Text style={[styles.toggleText, format === f && styles.toggleTextActive]}>
              {f === 'cash' ? 'Cash' : 'Tournament'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Site Name (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="PokerStars"
        placeholderTextColor={colors.textMuted}
        value={siteName}
        onChangeText={setSiteName}
      />

      {/* Tags */}
      <Text style={styles.label}>Tags</Text>
      <View style={styles.tagGrid}>
        {HAND_TAGS.map((tag) => (
          <TouchableOpacity
            key={tag}
            onPress={() => toggleTag(tag)}
            style={[styles.chip, selectedTags.includes(tag) && styles.chipActive]}
          >
            <Text style={[styles.chipText, selectedTags.includes(tag) && styles.chipTextActive]}>
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Visibility & anonymous */}
      <View style={styles.switchRow}>
        <Text style={styles.label}>Private post?</Text>
        <Switch
          value={visibility === 'private'}
          onValueChange={(val) => setVisibility(val ? 'private' : 'public')}
          trackColor={{ false: colors.border, true: colors.primaryDim }}
          thumbColor={visibility === 'private' ? colors.primary : colors.textMuted}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>Post anonymously?</Text>
        <Switch
          value={postAnonymous}
          onValueChange={setPostAnonymous}
          trackColor={{ false: colors.border, true: colors.primaryDim }}
          thumbColor={postAnonymous ? colors.primary : colors.textMuted}
        />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          style={[styles.saveBtn, loading && { opacity: 0.5 }]}
        >
          {loading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.saveText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDeep },
  content: { padding: spacing.lg, paddingBottom: spacing['4xl'] },
  heading: { fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold, color: colors.textPrimary, marginBottom: spacing.lg },
  label: { color: colors.textSecondary, fontSize: fontSizes.sm, fontWeight: fontWeights.medium, marginBottom: spacing.xs, marginTop: spacing.md },
  input: {
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    borderRadius: borderRadius.md, padding: spacing.md, color: colors.textPrimary, fontSize: fontSizes.md,
  },
  textArea: { minHeight: 120, textAlignVertical: 'top', fontFamily: 'monospace' },
  chipRow: { flexDirection: 'row', marginBottom: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard, marginRight: spacing.sm, marginBottom: spacing.sm,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '20' },
  chipText: { color: colors.textSecondary, fontSize: fontSizes.sm },
  chipTextActive: { color: colors.primary },
  toggleRow: { flexDirection: 'row', gap: spacing.sm },
  toggleBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', backgroundColor: colors.bgCard,
  },
  toggleActive: { borderColor: colors.primary, backgroundColor: colors.primary + '20' },
  toggleText: { color: colors.textSecondary, fontSize: fontSizes.md, fontWeight: fontWeights.medium },
  toggleTextActive: { color: colors.primary },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing['2xl'] },
  cancelBtn: {
    flex: 1, paddingVertical: spacing.lg, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  cancelText: { color: colors.textSecondary, fontSize: fontSizes.md, fontWeight: fontWeights.medium },
  saveBtn: { flex: 2, paddingVertical: spacing.lg, borderRadius: borderRadius.md, backgroundColor: colors.primary, alignItems: 'center' },
  saveText: { color: colors.textInverse, fontSize: fontSizes.md, fontWeight: fontWeights.bold },
});
