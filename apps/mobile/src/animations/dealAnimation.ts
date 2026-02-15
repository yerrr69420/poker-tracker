import {
  withDelay,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';

/**
 * Deal animation: slide a card into position with a spring snap and fade.
 * Flop cards (0-2) stagger tightly, turn/river have dramatic pauses.
 * @param translateX shared value for horizontal position
 * @param opacity shared value for opacity
 * @param index card index (0-4) for stagger timing
 */
export function dealCard(
  translateX: SharedValue<number>,
  opacity: SharedValue<number>,
  index: number
) {
  'worklet';
  const baseDelay = index < 3 ? index * 80 : (index === 3 ? 450 : 750);

  // Slide in with overshoot: spring past target then settle
  translateX.value = withDelay(
    baseDelay,
    withSequence(
      withTiming(-4, { duration: 220, easing: Easing.out(Easing.cubic) }),
      withSpring(0, { damping: 14, stiffness: 300, mass: 0.6 })
    )
  );

  opacity.value = withDelay(
    baseDelay,
    withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) })
  );
}

/**
 * Initialize shared values for a card that hasn't been dealt yet.
 */
export function resetDealPosition(
  translateX: SharedValue<number>,
  opacity: SharedValue<number>,
  startX = -60
) {
  'worklet';
  translateX.value = startX;
  opacity.value = 0;
}
