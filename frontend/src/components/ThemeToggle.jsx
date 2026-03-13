import { motion } from 'framer-motion';
import { Moon, SunMedium } from 'lucide-react';

function ThemeToggle({ theme, onToggle }) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -1 }}
      aria-label="Toggle theme"
      className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/70 px-3 py-2 text-xs font-semibold text-primary backdrop-blur transition dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100"
    >
      {theme === 'dark' ? <SunMedium size={15} /> : <Moon size={15} />}
      {theme === 'dark' ? 'Light' : 'Dark'}
    </motion.button>
  );
}

export default ThemeToggle;
