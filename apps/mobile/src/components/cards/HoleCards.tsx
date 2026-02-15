import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { spacing } from '@poker-tracker/shared';
import { type Card } from '@poker-tracker/shared';
import CardFace from './CardFace';

interface Props {
  cards: Card[];
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export default function HoleCards({ cards, size = 'md', animate = true }: Props) {
  return (
    <View style={styles.container}>
      {cards.map((card, i) => (
        <Animated.View
          key={`${card.rank}${card.suit}`}
          entering={animate ? FadeInLeft.delay(i * 150).springify() : undefined}
          style={[styles.cardWrapper, i > 0 && { marginLeft: -8 }]}
        >
          <CardFace card={card} size={size} />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardWrapper: {
    // slight overlap for a hand feel
  },
});
