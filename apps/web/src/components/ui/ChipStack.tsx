'use client';

import { motion } from 'framer-motion';

interface Props {
  amount: number;
  maxChips?: number;
}

const CHIP_COLORS = ['#00e5ff', '#00ff87', '#ff1744', '#ffab00', '#9c27b0'];
const CHIP_SIZE = 28;

export default function ChipStack({ amount, maxChips = 8 }: Props) {
  const abs = Math.abs(amount);
  const chipCount =
    abs === 0 ? 0 : Math.min(maxChips, Math.max(1, Math.floor(Math.log10(abs / 100 + 1) * 3) + 1));

  return (
    <div className="relative" style={{ width: CHIP_SIZE, height: chipCount * 6 + CHIP_SIZE }}>
      {Array.from({ length: chipCount }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 15 }}
          className="absolute rounded-full border-2 border-white/30 flex items-center justify-center"
          style={{
            width: CHIP_SIZE,
            height: CHIP_SIZE,
            backgroundColor: CHIP_COLORS[i % CHIP_COLORS.length],
            bottom: i * 6,
          }}
        >
          <div
            className="rounded-full border border-white/20"
            style={{ width: CHIP_SIZE * 0.5, height: CHIP_SIZE * 0.5 }}
          />
        </motion.div>
      ))}
    </div>
  );
}
