import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { spacing } from '@poker-tracker/shared';
import { type Card } from '@poker-tracker/shared';
import CardFace from './CardFace';

interface Props {
  cards: Card[];
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export default function BoardCards({ cards, size = 'md', animate = true }: Props) {
  return (
    <View style={styles.container}>
      {cards.map((card, i) => {
        // Flop comes together, turn and river are delayed more
        const delay = i < 3 ? i * 80 : (i === 3 ? 400 : 700);
        return (
          <Animated.View
            key={`${card.rank}${card.suit}`}
            entering={animate ? ZoomIn.delay(delay).springify().damping(14).stiffness(200) : undefined}
            style={styles.cardSlot}
          >
            <CardFace card={card} size={size} />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardSlot: {},
});
