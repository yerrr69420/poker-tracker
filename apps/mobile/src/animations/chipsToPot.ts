import {
  withDelay,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';

/**
 * Animate a chip sliding to the pot center, pausing, then splitting out.
 * Includes a scale punch on arrival at the pot for impact.
 * @param translateX horizontal position
 * @param translateY vertical position
 * @param scale scale value (starts at 1, punches up on pot arrival)
 * @param originX starting X
 * @param originY starting Y
 * @param targetX pot center X
 * @param targetY pot center Y
 * @param finalX ending X (profit/loss side)
 * @param finalY ending Y
 */
export function chipToPotAndSplit(
  translateX: SharedValue<number>,
  translateY: SharedValue<number>,
  scale: SharedValue<number>,
  originX: number,
  originY: number,
  targetX: number,
  targetY: number,
  finalX: number,
  finalY: number,
  delay = 0
) {
  'worklet';
  const slideDuration = 350;
  const pauseDuration = 250;
  const splitDuration = 300;

  translateX.value = originX;
  translateY.value = originY;
  scale.value = 1;

  // Slide to pot center
  translateX.value = withDelay(
    delay,
    withSequence(
      withTiming(targetX, { duration: slideDuration, easing: Easing.out(Easing.cubic) }),
      withDelay(pauseDuration, withSpring(finalX, { damping: 12, stiffness: 200 }))
    )
  );

  translateY.value = withDelay(
    delay,
    withSequence(
      withTiming(targetY, { duration: slideDuration, easing: Easing.out(Easing.cubic) }),
      withDelay(pauseDuration, withSpring(finalY, { damping: 12, stiffness: 200 }))
    )
  );

  // Scale punch on pot arrival, settle, then normal during split
  scale.value = withDelay(
    delay,
    withSequence(
      withTiming(1, { duration: slideDuration }),
      withSpring(1.3, { damping: 6, stiffness: 400, mass: 0.5 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    )
  );
}
