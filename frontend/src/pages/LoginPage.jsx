import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    <section className="relative mx-auto mt-14 w-full max-w-md overflow-hidden rounded-2xl border border-white/45 bg-white/70 p-6 shadow-glow backdrop-blur-2xl dark:border-slate-700 dark:bg-slate-950/75">
      <div className="pointer-events-none absolute -right-12 -top-10 h-36 w-36 rounded-full bg-indigo-100/80 blur-2xl" />
      <div className="pointer-events-none absolute -left-12 bottom-4 h-32 w-32 rounded-full bg-cyan-100/80 blur-2xl" />
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-heading text-3xl text-primary"
      >
        Sign In
      </motion.h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Continue your learning journey with a secure sign in.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} />
          Remember me
        </label>

        <AnimatedButton type="submit" loading={loading} variant="accent" className="w-full">
          {loading ? 'Signing In...' : 'Sign In'}
        </AnimatedButton>
      </form>

      <div className="mt-4 flex items-center justify-between text-sm">
        <button className="text-accent transition hover:text-indigo-700">Forgot password</button>
        <Link to="/signup" className="text-primary transition hover:text-accent">
          Create account
        </Link>
      </div>
    </section>
  );
}

export default LoginPage;
