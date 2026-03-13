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
    <section className="-mx-4 -mb-10 flex min-h-[calc(100vh-5rem)] items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-12 dark:from-slate-900 dark:to-slate-950 md:-mx-6 md:px-6">

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-8 shadow-card dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-7 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.08, duration: 0.4 }}
              className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600"
            >
              <UserPlus size={24} className="text-white" />
            </motion.div>
            <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">Create Account</h1>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">Join ForensIQ and unlock courses, resources, and workshops</p>
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
                className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors duration-200 focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.2)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 ${errors.class_id ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'}`}
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
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-500 dark:text-slate-300 md:col-span-2">
              <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} className="accent-indigo-600" />
              I agree to the Terms of Service and Privacy Policy
            </label>
            <AnimatedButton type="submit" disabled={loading} loading={loading} variant="primary" className="py-3 text-base md:col-span-2">
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
