import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService, classService } from '../services/api';
import { setAuthSession } from '../services/authStorage';
import AnimatedButton from '../components/ui/AnimatedButton';
import FloatingInput from '../components/ui/FloatingInput';

const initialForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  class_id: '',
  agree: false
};

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [classLoading, setClassLoading] = useState(true);
  const [classLoadError, setClassLoadError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setClassLoading(true);
        setClassLoadError('');
        const classRes = await classService.getClasses();
        const items = classRes.data || [];
        setClasses(items);
        if (items.length === 0) setClassLoadError('No classes loaded yet. Please contact support.');
      } catch (error) {
        setClassLoadError(error.response?.data?.message || 'Failed to load classes');
        toast.error('Failed to load classes');
      } finally {
        setClassLoading(false);
      }
    };

    loadOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {};

    if (!form.first_name.trim()) nextErrors.first_name = 'First name is required';
    if (!form.last_name.trim()) nextErrors.last_name = 'Last name is required';
    if (!form.email.includes('@')) nextErrors.email = 'Enter a valid email';
    if (form.password.length < 6) nextErrors.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';
    if (!form.class_id && !classLoading) nextErrors.class_id = 'Select your class';

    if (!form.agree) {
      toast.error('Please accept terms');
      return;
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      toast.error('Please fix highlighted fields');
      return;
    }

    try {
      setErrors({});
      setLoading(true);
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        class_id: Number(form.class_id)
      };
      const response = await authService.register(payload);
      setAuthSession(response.data.token, response.data.user);
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
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
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="overflow-hidden rounded-2xl border border-indigo-100/70 bg-white/80 p-8 shadow-[0_20px_60px_rgba(99,102,241,0.15),0_4px_16px_rgba(0,0,0,0.06)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          <div className="mb-7 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.08, duration: 0.4 }}
              className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30"
            >
              <UserPlus size={24} className="text-white" />
            </motion.div>
            <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">Create Account</h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Join ForensIQ and unlock courses, resources, and workshops</p>
          </div>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <FloatingInput
              name="first_name"
              label="First Name"
              value={form.first_name}
              onChange={handleChange}
              required
              error={errors.first_name}
            />
            <FloatingInput
              name="last_name"
              label="Last Name"
              value={form.last_name}
              onChange={handleChange}
              required
              error={errors.last_name}
            />
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
              type="tel"
              name="phone"
              label="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
              error={errors.phone}
            />
            <label className="relative block">
              <select
                name="class_id"
                value={form.class_id}
                onChange={handleChange}
                disabled={classLoading}
                className={`w-full rounded-xl border bg-white/80 px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)] dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 ${errors.class_id ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'}`}
                required
              >
                <option value="">{classLoading ? 'Loading classes…' : 'Select Your Class'}</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              {classLoadError ? <span className="mt-1 block text-xs text-rose-500">{classLoadError}</span> : null}
              {errors.class_id ? <span className="mt-1 block text-xs text-rose-500">{errors.class_id}</span> : null}
            </label>
            <FloatingInput
              type="password"
              name="password"
              label="Password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              error={errors.password}
            />
            <FloatingInput
              type="password"
              name="confirmPassword"
              label="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              error={errors.confirmPassword}
            />
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-500 dark:text-slate-400 md:col-span-2">
              <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} className="accent-indigo-600" />
              I agree to the Terms of Service and Privacy Policy
            </label>
            <AnimatedButton type="submit" disabled={loading} loading={loading} variant="accent" className="py-3 text-base md:col-span-2">
              {loading ? 'Creating Account…' : 'Create Account'}
            </AnimatedButton>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
              Sign in →
            </Link>
          </p>
        </div>
      </motion.div>
    </section>
  );
}

export default SignupPage;
