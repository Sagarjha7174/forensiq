import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/api';
import { setAuthSession } from '../services/authStorage';
import AnimatedButton from '../components/ui/AnimatedButton';
import FloatingInput from '../components/ui/FloatingInput';

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {};
    if (!form.email.includes('@')) nextErrors.email = 'Enter a valid email';
    if (form.password.length < 6) nextErrors.password = 'Minimum 6 characters';

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      toast.error('Please fix highlighted fields');
      return;
    }

    try {
      setErrors({});
      setLoading(true);
      const response = await authService.login({ email: form.email, password: form.password });
      setAuthSession(response.data.token, response.data.user);
      toast.success('Signed in successfully');
      navigate(response.data.user?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative -mx-4 -mb-10 flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-4 py-12 md:-mx-6 md:px-6">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />
      <div className="auth-blob auth-blob-3" />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="overflow-hidden rounded-2xl border border-indigo-100/70 bg-white/80 p-8 shadow-[0_20px_60px_rgba(99,102,241,0.15),0_4px_16px_rgba(0,0,0,0.06)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          <div className="mb-7 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.08, duration: 0.4 }}
              className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30"
            >
              <ShieldCheck size={24} className="text-white" />
            </motion.div>
            <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Sign in to continue your learning journey</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <FloatingInput
              type="email"
              name="email"
              label="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              error={errors.email}
            />
            <FloatingInput
              type="password"
              name="password"
              label="Password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              error={errors.password}
            />

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} className="accent-indigo-600" />
                Remember me
              </label>
              <button type="button" className="text-sm text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                Forgot password?
              </button>
            </div>

            <AnimatedButton type="submit" loading={loading} variant="accent" className="w-full py-3 text-base">
              {loading ? 'Signing In…' : 'Sign In'}
            </AnimatedButton>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
              Create one free →
            </Link>
          </p>
        </div>
      </motion.div>
    </section>
  );
}

export default LoginPage;
