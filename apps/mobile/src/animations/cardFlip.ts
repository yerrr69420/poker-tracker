import { withTiming, withSpring, withSequence, Easing, type SharedValue } from 'react-native-reanimated';

/**
 * Flip a card from face-down (180) to face-up (0) with a slight overshoot.
 */
export function flipToFront(rotation: SharedValue<number>, duration = 350) {
  'worklet';
  rotation.value = withSequence(
    withTiming(-8, { duration: duration * 0.8, easing: Easing.out(Easing.cubic) }),
    withSpring(0, { damping: 12, stiffness: 200 })
  );
}

/**
 * Flip a card from face-up (0) to face-down (180).
 */
export function flipToBack(rotation: SharedValue<number>, duration = 350) {
  'worklet';
  rotation.value = withTiming(180, { duration, easing: Easing.in(Easing.cubic) });
}
