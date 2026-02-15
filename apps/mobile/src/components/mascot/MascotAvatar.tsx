import React from 'react';
import { Image, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors } from '@poker-tracker/shared';

interface Props {
  size?: number;
  mood?: 'neutral' | 'profit' | 'loss';
  style?: ViewStyle;
}

export default function MascotAvatar({ size = 48, mood = 'neutral', style }: Props) {
  const glowOpacity = useSharedValue(0);

  const glowColor =
    mood === 'profit' ? colors.profitGlow :
    mood === 'loss' ? colors.lossGlow :
    colors.primaryGlow;

  useEffect(() => {
    if (mood === 'profit') {
      // Fast, energetic pulse for winning sessions
      glowOpacity.value = withRepeat(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else if (mood === 'loss') {
      // Slower, dimmer pulse for losing sessions
      glowOpacity.value = withRepeat(
        withTiming(0.6, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      glowOpacity.value = 0;
    }
  }, [mood]);

  const animatedGlow = useAnimatedStyle(() => ({
    shadowColor: glowColor,
    shadowOpacity: glowOpacity.value * 0.9,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: glowOpacity.value > 0 ? 12 : 0,
  }));

  return (
    <Animated.View style={[{ width: size, height: size, borderRadius: size / 2 }, animatedGlow, style]}>
      <Image
        source={require('../../../assets/mascot.png')}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        resizeMode="cover"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.bgCard,
  },
});
