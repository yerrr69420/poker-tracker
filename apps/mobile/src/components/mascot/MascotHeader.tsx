import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes, fontWeights } from '@poker-tracker/shared';
import MascotAvatar from './MascotAvatar';

interface Props {
  title: string;
  subtitle?: string;
  mood?: 'neutral' | 'profit' | 'loss';
}

export default function MascotHeader({ title, subtitle, mood = 'neutral' }: Props) {
  return (
    <View style={styles.container}>
      <MascotAvatar size={40} mood={mood} />
      <View style={styles.textCol}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  textCol: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    marginTop: 2,
  },
});
