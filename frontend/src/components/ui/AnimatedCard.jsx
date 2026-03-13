import { motion } from 'framer-motion';

function AnimatedCard({ children, className = '', delay = 0, hover = true }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay }}
      whileHover={hover ? { y: -7, rotateX: 2, rotateY: -1 } : undefined}
      className={`glass-card rounded-2xl border border-white/35 shadow-glow dark:border-slate-700 ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.article>
  );
}

export default AnimatedCard;
