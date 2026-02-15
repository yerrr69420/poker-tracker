'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  pendingCount: number;
}

export default function SyncIndicator({ pendingCount }: Props) {
  return (
    <AnimatePresence>
      {pendingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="inline-flex items-center gap-1.5 bg-warning/10 text-warning px-3 py-1 rounded-full text-xs"
        >
          <motion.div
            className="w-2 h-2 rounded-full bg-warning"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          {pendingCount} pending
        </motion.div>
      )}
    </AnimatePresence>
  );
}
