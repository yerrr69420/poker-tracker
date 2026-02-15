'use client';

import { motion } from 'framer-motion';

interface Props {
  size?: number;
  mood?: 'neutral' | 'profit' | 'loss';
  className?: string;
}

const GLOW_MAP = {
  neutral: 'none',
  profit: '0 0 20px 4px rgba(0, 255, 135, 0.5)',
  loss: '0 0 20px 4px rgba(255, 23, 68, 0.4)',
};

const GLOW_MAP_DIM = {
  neutral: 'none',
  profit: '0 0 10px 0 rgba(0, 255, 135, 0.2)',
  loss: '0 0 10px 0 rgba(255, 23, 68, 0.15)',
};

export default function MascotAvatar({ size = 48, mood = 'neutral', className = '' }: Props) {
  return (
    <motion.img
      src="/mascot.png"
      alt="Poker Tracker mascot"
      className={`rounded-full bg-bg-card ${className}`}
      style={{ width: size, height: size }}
      animate={
        mood !== 'neutral'
          ? { boxShadow: [GLOW_MAP_DIM[mood], GLOW_MAP[mood], GLOW_MAP_DIM[mood]] }
          : {}
      }
      transition={mood !== 'neutral' ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
    />
  );
}
