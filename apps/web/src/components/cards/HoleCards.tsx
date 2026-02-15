'use client';

import { motion } from 'framer-motion';
import { type Card } from '@poker-tracker/shared';
import CardFace from './CardFace';

interface Props {
  cards: Card[];
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export default function HoleCards({ cards, size = 'md', animate = true }: Props) {
  return (
    <div className="flex items-center">
      {cards.map((card, i) => (
        <motion.div
          key={`${card.rank}${card.suit}`}
          initial={animate ? { opacity: 0, x: -20 } : undefined}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15, type: 'spring', stiffness: 300, damping: 20 }}
          style={{ marginLeft: i > 0 ? -8 : 0 }}
        >
          <CardFace card={card} size={size} />
        </motion.div>
      ))}
    </div>
  );
}
