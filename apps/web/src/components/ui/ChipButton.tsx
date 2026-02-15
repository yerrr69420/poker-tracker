'use client';

import { motion } from 'framer-motion';

interface Props {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'profit' | 'loss' | 'outline';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

const VARIANTS = {
  primary: 'bg-primary text-text-inverse border-primary',
  profit: 'bg-profit text-text-inverse border-profit',
  loss: 'bg-loss text-text-primary border-loss',
  outline: 'bg-transparent text-primary border-primary',
} as const;

export default function ChipButton({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  type = 'button',
}: Props) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-full border-2 font-bold text-sm transition-opacity disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 450, damping: 14, mass: 0.8 }}
    >
      {label}
    </motion.button>
  );
}
