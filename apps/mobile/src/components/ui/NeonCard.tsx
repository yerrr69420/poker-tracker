import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors, spacing, borderRadius } from '@poker-tracker/shared';

interface Props {
  children: React.ReactNode;
  glowColor?: string;
  pulse?: boolean;
  style?: ViewStyle;
}

export default function NeonCard({
  children,
  glowColor = colors.primary,
  pulse = false,
  style,
}: Props) {
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    if (pulse) {
      glowOpacity.value = withRepeat(
        withTiming(0.85, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      glowOpacity.value = 0.4;
    }
  }, [pulse]);

  const animatedShadow = useAnimatedStyle(() => ({
    shadowColor: glowColor,
    shadowOpacity: glowOpacity.value,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 2 },
    elevation: 10,
  }));

  return (
    <Animated.View style={[styles.card, animatedShadow, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
});
