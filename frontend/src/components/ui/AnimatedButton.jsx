import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  accent: 'bg-teal-600 text-white hover:bg-teal-700',
  ghost: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
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
      whileHover={{ y: -1 }}
      whileTap={whileTap || { scale: 0.97 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${className}`}
    >
      {Icon ? <Icon size={16} /> : null}
      {loading ? 'Please wait...' : children}
    </motion.button>
  );
}

export default AnimatedButton;
