'use client';

import { motion } from 'framer-motion';
import { type Card } from '@poker-tracker/shared';
import CardFace from './CardFace';

interface Props {
  cards: Card[];
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export default function BoardCards({ cards, size = 'md', animate = true }: Props) {
  return (
    <div className="flex items-center gap-1">
      {cards.map((card, i) => {
        const delay = i < 3 ? i * 0.08 : i === 3 ? 0.4 : 0.7;
        return (
          <motion.div
            key={`${card.rank}${card.suit}`}
            initial={animate ? { opacity: 0, scale: 0.6 } : undefined}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, type: 'spring', stiffness: 300, damping: 14 }}
          >
            <CardFace card={card} size={size} />
          </motion.div>
        );
      })}
    </div>
  );
}
