'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  glowColor?: 'cyan' | 'green' | 'red';
  pulse?: boolean;
  className?: string;
}

const GLOW_SHADOWS = {
  cyan: '0 0 15px 0 rgba(0, 229, 255, 0.4)',
  green: '0 0 15px 0 rgba(0, 255, 135, 0.4)',
  red: '0 0 15px 0 rgba(255, 23, 68, 0.4)',
};

const GLOW_SHADOWS_BRIGHT = {
  cyan: '0 0 25px 2px rgba(0, 229, 255, 0.6)',
  green: '0 0 25px 2px rgba(0, 255, 135, 0.6)',
  red: '0 0 25px 2px rgba(255, 23, 68, 0.6)',
};

export default function NeonCard({
  children,
  glowColor = 'cyan',
  pulse = false,
  className = '',
}: Props) {
  return (
    <motion.div
      className={`bg-bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 relative z-10 matrix-card-hover ${className}`}
      animate={
        pulse
          ? {
              boxShadow: [
                GLOW_SHADOWS[glowColor],
                GLOW_SHADOWS_BRIGHT[glowColor],
                GLOW_SHADOWS[glowColor],
              ],
            }
          : { boxShadow: GLOW_SHADOWS[glowColor] }
      }
      transition={pulse ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      <>{children as React.ReactNode}</>
    </motion.div>
  );
}
