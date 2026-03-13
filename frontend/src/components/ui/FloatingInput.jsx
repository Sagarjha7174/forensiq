import { motion } from 'framer-motion';

function FloatingInput({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  autoComplete,
  error,
  className = ''
}) {
  const active = Boolean(value);

  return (
    <motion.label
      animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.3 }}
      className={`group relative block ${className}`}
    >
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        placeholder=" "
        className={`peer w-full rounded-xl border bg-white/80 px-4 pb-2.5 pt-6 text-sm text-slate-800 shadow-inner outline-none transition-all duration-300 focus:scale-[1.01] focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)] dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-400 dark:shadow-none dark:focus:border-indigo-400 ${error ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'}`}
      />
      <span
        className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 bg-transparent px-1 text-sm text-slate-400 transition-all duration-300 peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-indigo-600 dark:text-slate-500 dark:peer-focus:text-indigo-400 ${active ? 'top-2.5 translate-y-0 text-xs text-indigo-600 dark:text-indigo-400' : ''}`}
      >
        {label}
      </span>
      {error ? <span className="mt-1 block text-xs text-rose-600">{error}</span> : null}
    </motion.label>
  );
}

export default FloatingInput;
