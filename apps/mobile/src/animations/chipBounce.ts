import { withSpring, withSequence, type SharedValue } from 'react-native-reanimated';

/**
 * Chip bounce-in: quick squish down with a snappy spring.
 */
export function chipBounceIn(scale: SharedValue<number>) {
  'worklet';
  scale.value = withSpring(0.85, { damping: 14, stiffness: 450, mass: 0.8 });
}

/**
 * Chip bounce-out: spring back with a slight overshoot for a satisfying pop.
 */
export function chipBounceOut(scale: SharedValue<number>) {
  'worklet';
  scale.value = withSequence(
    withSpring(1.06, { damping: 6, stiffness: 500, mass: 0.6 }),
    withSpring(1, { damping: 10, stiffness: 300 })
  );
}
