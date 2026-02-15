import React from 'react';
import { Text, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '@poker-tracker/shared';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'profit' | 'loss' | 'outline';
  disabled?: boolean;
  style?: ViewStyle;
}

const VARIANT_COLORS = {
  primary: { bg: colors.primary, text: colors.textInverse, border: colors.primary },
  profit: { bg: colors.profit, text: colors.textInverse, border: colors.profit },
  loss: { bg: colors.loss, text: colors.textPrimary, border: colors.loss },
  outline: { bg: 'transparent', text: colors.primary, border: colors.primary },
} as const;

export default function ChipButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: Props) {
  const scale = useSharedValue(1);
  const c = VARIANT_COLORS[variant];

  const fireHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.85, { damping: 14, stiffness: 450, mass: 0.8 });
    })
    .onFinalize(() => {
      scale.value = withSequence(
        withSpring(1.06, { damping: 6, stiffness: 500, mass: 0.6 }),
        withSpring(1, { damping: 10, stiffness: 300 })
      );
    })
    .onEnd(() => {
      if (!disabled) {
        runOnJS(fireHaptic)();
        runOnJS(onPress)();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: c.bg,
            borderColor: c.border,
            opacity: disabled ? 0.5 : 1,
          },
          animatedStyle,
          style,
        ]}
      >
        <Text style={[styles.label, { color: c.text }]}>{label}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
  },
});
