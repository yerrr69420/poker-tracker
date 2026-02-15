import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  FadeInUp,
} from 'react-native-reanimated';
import { colors } from '@poker-tracker/shared';

interface Props {
  /** Amount in cents — determines number of chips shown */
  amount: number;
  maxChips?: number;
}

const CHIP_COLORS = [colors.primary, colors.profit, colors.loss, colors.warning, '#9c27b0'];
const CHIP_SIZE = 28;

export default function ChipStack({ amount, maxChips = 8 }: Props) {
  // Scale chips logarithmically so it looks right for any amount
  const abs = Math.abs(amount);
  const chipCount = abs === 0 ? 0 : Math.min(maxChips, Math.max(1, Math.floor(Math.log10(abs / 100 + 1) * 3) + 1));

  return (
    <View style={[styles.container, { height: chipCount * 6 + CHIP_SIZE }]}>
      {Array.from({ length: chipCount }).map((_, i) => (
        <Animated.View
          key={i}
          entering={FadeInUp.delay(i * 60).springify()}
          style={[
            styles.chip,
            {
              backgroundColor: CHIP_COLORS[i % CHIP_COLORS.length],
              bottom: i * 6,
            },
          ]}
        >
          <View style={styles.chipInner} />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CHIP_SIZE,
    position: 'relative',
  },
  chip: {
    position: 'absolute',
    width: CHIP_SIZE,
    height: CHIP_SIZE,
    borderRadius: CHIP_SIZE / 2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipInner: {
    width: CHIP_SIZE * 0.5,
    height: CHIP_SIZE * 0.5,
    borderRadius: CHIP_SIZE * 0.25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});
