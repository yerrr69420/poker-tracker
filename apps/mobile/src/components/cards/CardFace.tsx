import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '@poker-tracker/shared';
import { SUIT_SYMBOLS, SUIT_COLORS, type Card } from '@poker-tracker/shared';

interface Props {
  card: Card;
  size?: 'sm' | 'md' | 'lg';
  faceDown?: boolean;
  flipDelay?: number;
}

const SIZES = {
  sm: { width: 36, height: 50, fontSize: 14, symbolSize: 10 },
  md: { width: 48, height: 68, fontSize: 18, symbolSize: 14 },
  lg: { width: 64, height: 90, fontSize: 24, symbolSize: 18 },
};

export default function CardFace({ card, size = 'md', faceDown = false, flipDelay = 0 }: Props) {
  const rotation = useSharedValue(faceDown ? 180 : 0);
  const s = SIZES[size];
  const suitColor = SUIT_COLORS[card.suit];

  useEffect(() => {
    if (!faceDown) {
      rotation.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      rotation.value = 180;
    }
  }, [faceDown]);

  const frontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [0, 180]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden' as const,
      opacity: rotateY > 90 ? 0 : 1,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [180, 360]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden' as const,
      opacity: rotateY > 90 && rotateY < 270 ? 1 : 0,
    };
  });

  return (
    <View style={[styles.wrapper, { width: s.width, height: s.height }]}>
      {/* Front face */}
      <Animated.View style={[styles.face, styles.front, { width: s.width, height: s.height }, frontStyle]}>
        <Text style={[styles.rank, { fontSize: s.fontSize, color: suitColor }]}>
          {card.rank}
        </Text>
        <Text style={[styles.suit, { fontSize: s.symbolSize, color: suitColor }]}>
          {SUIT_SYMBOLS[card.suit]}
        </Text>
      </Animated.View>

      {/* Back face */}
      <Animated.View style={[styles.face, styles.back, { width: s.width, height: s.height }, backStyle]}>
        <View style={styles.backPattern} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  face: {
    position: 'absolute',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  front: {
    backgroundColor: '#1a1a2e',
    borderColor: colors.borderLight,
    padding: spacing.xs,
    justifyContent: 'space-between',
  },
  back: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPattern: {
    width: '70%',
    height: '70%',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  rank: {
    fontWeight: fontWeights.bold,
    lineHeight: undefined,
  },
  suit: {
    alignSelf: 'flex-end',
  },
});
