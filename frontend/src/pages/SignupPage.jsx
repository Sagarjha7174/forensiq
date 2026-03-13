import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService, classService, courseService } from '../services/api';
import { setAuthSession } from '../services/authStorage';

const initialForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  class_id: '',
  course_id: '',
  agree: false
};

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [classRes, courseRes] = await Promise.all([
          classService.getClasses(),
          courseService.getCourses()
        ]);
        setClasses(classRes.data || []);
        setCourses(courseRes.data || []);
      } catch (error) {
        toast.error('Failed to load classes/courses');
      }
    };

    loadOptions();
  }, []);

  const filteredCourses = courses.filter(
    (course) => !form.class_id || Number(course.class_id) === Number(form.class_id)
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.agree) {
      toast.error('Please accept terms');
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        class_id: Number(form.class_id),
        course_id: form.course_id ? Number(form.course_id) : null
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
    <div className="mx-auto mt-14 w-full max-w-2xl rounded-2xl border border-white/50 bg-white/80 p-6 shadow-glow backdrop-blur-xl">
      <h1 className="font-heading text-3xl text-primary">Create Account</h1>
      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={form.first_name}
          onChange={handleChange}
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
          required
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={form.last_name}
          onChange={handleChange}
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
          required
        />
        <select
          name="class_id"
          value={form.class_id}
          onChange={handleChange}
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
          required
        >
          <option value="">Select Class</option>
          {classes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          name="course_id"
          value={form.course_id}
          onChange={handleChange}
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
        >
          <option value="">Select Course</option>
          {filteredCourses.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name || item.title}
            </option>
          ))}
        </select>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
          required
        />
        <label className="md:col-span-2 flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} />
          I agree to terms
        </label>
        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 rounded-lg bg-accent px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="text-primary">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default SignupPage;
