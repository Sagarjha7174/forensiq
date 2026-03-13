import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    <section className="relative mx-auto mt-14 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/50 bg-white/75 p-6 shadow-glow backdrop-blur-2xl dark:border-slate-700 dark:bg-slate-950/75">
      <div className="pointer-events-none absolute -right-14 top-10 h-44 w-44 rounded-full bg-indigo-100/75 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-8 h-36 w-36 rounded-full bg-teal-100/75 blur-3xl" />
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-heading text-3xl text-primary"
      >
        Create Account
      </motion.h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Join the platform and unlock courses, resources, and workshops.</p>

      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
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
          label="Email"
          value={form.email}
          onChange={handleChange}
          required
          autoComplete="email"
          error={errors.email}
        />
        <FloatingInput
          type="tel"
          name="phone"
          label="Phone"
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
            className={`w-full rounded-xl border bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-accent focus:shadow-[0_0_0_3px_rgba(79,70,229,0.15)] dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 ${errors.class_id ? 'border-rose-400' : 'border-white/35'}`}
            required
          >
            <option value="">{classLoading ? 'Loading classes...' : 'Select Class'}</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {classLoadError ? <span className="mt-1 block text-xs text-rose-600">{classLoadError}</span> : null}
          {errors.class_id ? <span className="mt-1 block text-xs text-rose-600">{errors.class_id}</span> : null}
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
        <label className="md:col-span-2 flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} />
          I agree to terms
        </label>
        <AnimatedButton type="submit" disabled={loading} loading={loading} variant="accent" className="md:col-span-2">
          {loading ? 'Submitting...' : 'Submit'}
        </AnimatedButton>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="text-primary">
          Sign in
        </Link>
      </p>
    </section>
  );
}

export default SignupPage;
