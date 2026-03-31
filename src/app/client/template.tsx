'use client';

import { motion } from 'framer-motion';

export default function ClientTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 10 }}
      transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}
