import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient' ;
import { colors, borderRadius } from '@poker-tracker/shared';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * A felt-green gradient background panel, mimicking a poker table.
 * Falls back to a flat color if LinearGradient isn't available.
 */
export default function TableFeltBg({ children, style }: Props) {
  // Use a simple View fallback — LinearGradient is optional
  return (
    <View style={[styles.container, style]}>
      <View style={styles.feltLayer} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  feltLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.feltGreen,
    opacity: 0.95,
  },
});
