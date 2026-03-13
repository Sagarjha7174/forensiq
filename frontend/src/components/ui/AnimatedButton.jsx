import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-primary text-white hover:shadow-[0_10px_30px_rgba(15,39,68,0.35)]',
  accent: 'bg-accent text-white hover:shadow-[0_10px_30px_rgba(79,70,229,0.35)]',
  ghost: 'border border-white/40 bg-white/10 text-slate-800 backdrop-blur-xl hover:bg-white/20'
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
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-300 disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${className}`}
    >
      {Icon ? <Icon size={16} /> : null}
      {loading ? 'Please wait...' : children}
    </motion.button>
  );
}

export default AnimatedButton;
