import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-gradient-to-r from-primary to-secondary text-white hover:from-secondary hover:to-deep hover:shadow-[0_10px_30px_rgba(99,102,241,0.4)] hover:scale-105',
  accent: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:from-indigo-600 hover:to-purple-700 hover:shadow-[0_12px_32px_rgba(139,92,246,0.45)] hover:scale-105',
  ghost: 'border border-white/40 bg-white/10 text-slate-800 backdrop-blur-xl hover:bg-white/25 dark:text-slate-200 dark:border-white/20 dark:hover:bg-white/10'
};

function AnimatedButton({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  onClick,
  whileTap,
  icon: Icon,
  loading = false
}) {
  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={whileTap || { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${className}`}
    >
      {Icon ? <Icon size={16} /> : null}
      {loading ? 'Please wait...' : children}
    </motion.button>
  );
}

export default AnimatedButton;
