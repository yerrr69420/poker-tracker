'use client';

import { motion } from 'framer-motion';
import { SUIT_SYMBOLS, SUIT_COLORS, type Card } from '@poker-tracker/shared';

interface Props {
  card: Card;
  size?: 'sm' | 'md' | 'lg';
  faceDown?: boolean;
  flipDelay?: number;
}

const SIZES = {
  sm: { w: 36, h: 50, text: 'text-sm', symbol: 'text-[10px]' },
  md: { w: 48, h: 68, text: 'text-lg', symbol: 'text-sm' },
  lg: { w: 64, h: 90, text: 'text-2xl', symbol: 'text-lg' },
};

export default function CardFace({ card, size = 'md', faceDown = false, flipDelay = 0 }: Props) {
  const s = SIZES[size];
  const suitColor = SUIT_COLORS[card.suit];

  return (
    <div className="relative" style={{ width: s.w, height: s.h, perspective: 600 }}>
      <motion.div
        className="absolute inset-0"
        initial={{ rotateY: faceDown ? 180 : 0 }}
        animate={{ rotateY: faceDown ? 180 : 0 }}
        transition={{ duration: 0.4, delay: flipDelay, ease: 'easeOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front — 4-color deck: spades black, hearts red, diamonds blue, clubs green */}
        <div
          className="absolute inset-0 rounded border-2 p-1 flex flex-col justify-between shadow-md"
          style={{
            backgroundColor: '#fafafa',
            borderColor: suitColor,
            backfaceVisibility: 'hidden',
          }}
        >
          <span className={`${s.text} font-bold leading-none`} style={{ color: suitColor }}>
            {card.rank}
          </span>
          <span className={`${s.symbol} self-end font-bold`} style={{ color: suitColor }}>
            {SUIT_SYMBOLS[card.suit]}
          </span>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded border border-primary bg-primary-dim flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="w-[70%] h-[70%] rounded border border-white/20" />
        </div>
      </motion.div>
    </div>
  );
}
