import { motion } from 'framer-motion';

function AnimatedCard({ children, className = '', delay = 0, hover = true }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay }}
      whileHover={hover ? { y: -6 } : undefined}
      className={`glass-card rounded-2xl border border-slate-200/70 transition-all duration-300 hover:shadow-[0_24px_60px_rgba(34,211,238,0.14)] dark:border-slate-800/90 ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.article>
  );
}

export default AnimatedCard;
