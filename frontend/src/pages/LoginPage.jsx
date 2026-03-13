import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/api';
import { setAuthSession } from '../services/authStorage';

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
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
    <div className="mx-auto mt-14 w-full max-w-md rounded-2xl border border-white/50 bg-white/80 p-6 shadow-glow backdrop-blur-xl">
      <h1 className="font-heading text-3xl text-primary">Sign In</h1>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
          required
        />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} />
          Remember me
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      <div className="mt-4 flex items-center justify-between text-sm">
        <button className="text-accent">Forgot password</button>
        <Link to="/signup" className="text-primary">
          Create account
        </Link>
      </div>
    </div>
  );
}

export default LoginPage;
