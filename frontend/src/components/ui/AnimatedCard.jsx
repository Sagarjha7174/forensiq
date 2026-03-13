import { motion } from 'framer-motion';

function AnimatedCard({ children, className = '', delay = 0, hover = true }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, delay }}
      whileHover={hover ? { y: -2 } : undefined}
      className={`glass-card rounded-xl border border-slate-200 transition-shadow duration-200 hover:shadow-card-hover dark:border-slate-700 ${className}`}
    >
      {children}
    </motion.article>
  );
}

export default AnimatedCard;
