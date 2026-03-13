import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  authService,
  courseService,
  enrollmentService,
  notificationService,
  resourceService
} from '../services/api';
import { getStoredUser, setAuthSession } from '../services/authStorage';

const sections = ['Dashboard', 'Profile', 'Courses', 'My Courses', 'Notifications', 'Resources'];

function DashboardPage() {
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [resources, setResources] = useState([]);

  const user = getStoredUser();

  const initLoad = async () => {
    try {
      setLoading(true);
      const [profileRes, coursesRes, myCoursesRes, notiRes, resourcesRes] = await Promise.all([
        authService.profile(),
        courseService.getCourses({ class_id: user?.class_id }),
        enrollmentService.getMyCourses(),
        notificationService.getNotifications(),
        resourceService.getResources()
      ]);

      const profileData = profileRes.data;
      setProfile(profileData);
      setProfileForm({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        phone: profileData.phone || ''
      });

      setCourses(coursesRes.data || []);
      setMyCourses(myCoursesRes.data || []);
      setNotifications(notiRes.data || []);
      setResources(resourcesRes.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initLoad();
  }, []);

  const enrolledCourseIds = useMemo(
    () => new Set(myCourses.map((entry) => entry.course?.id).filter(Boolean)),
    [myCourses]
  );

  const refreshMyCourses = async () => {
    const myCoursesRes = await enrollmentService.getMyCourses();
    setMyCourses(myCoursesRes.data || []);
  };

  const handleFreeBuy = async (courseId) => {
    try {
      await enrollmentService.enrollFree({ course_id: courseId });
      toast.success('Test enrollment successful');
      await refreshMyCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Enrollment failed');
    }
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleRazorpayBuy = async (course) => {
    try {
      const ok = await loadRazorpayScript();
      if (!ok) {
        toast.error('Unable to load Razorpay checkout');
        return;
      }

      const orderRes = await enrollmentService.createOrder({ course_id: course.id });
      const order = orderRes.data;

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'ForensIQ',
        description: `Enrollment for ${course.title || course.name}`,
        order_id: order.order_id,
        handler: async function (response) {
          try {
            await enrollmentService.verifyPayment({
              course_id: course.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            toast.success('Payment verified and enrollment completed');
            await refreshMyCourses();
          } catch (error) {
            toast.error(error.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
          email: profile?.email || '',
          contact: profile?.phone || ''
        },
        theme: { color: '#253347' }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment initiation failed');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        phone: profileForm.phone
      };
      const response = await authService.updateProfile(payload);
      const updated = response.data.user;
      setAuthSession(localStorage.getItem('token'), { ...user, ...updated });
      setProfile(updated);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Profile update failed');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      await authService.changePassword(passwordForm);
      toast.success('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password change failed');
    }
  };

  return (
    <section className="mt-8 grid gap-6 md:grid-cols-[220px_1fr]">
      <aside className="glass-card h-fit rounded-2xl p-4 shadow-glow">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Student Panel</p>
        <div className="space-y-2">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                activeSection === section ? 'bg-primary text-white' : 'bg-white/60 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {section}
            </button>
          ))}
        </div>
      </aside>

      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-6"
      >
        {loading && <div className="skeleton h-48" />}

        {!loading && activeSection === 'Dashboard' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="glass-card rounded-2xl p-5">
              <p className="text-sm text-slate-500">My Courses</p>
              <p className="mt-2 text-3xl font-bold text-primary">{myCourses.length}</p>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <p className="text-sm text-slate-500">Available Courses</p>
              <p className="mt-2 text-3xl font-bold text-primary">{courses.length}</p>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <p className="text-sm text-slate-500">Resources</p>
              <p className="mt-2 text-3xl font-bold text-primary">{resources.length}</p>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <p className="text-sm text-slate-500">Notifications</p>
              <p className="mt-2 text-3xl font-bold text-primary">{notifications.length}</p>
            </div>
          </div>
        )}

        {!loading && activeSection === 'Profile' && (
          <div className="grid gap-5 lg:grid-cols-2">
            <form onSubmit={handleProfileUpdate} className="glass-card rounded-2xl p-5 shadow-glow">
              <h3 className="text-lg font-semibold text-primary">Edit Profile</h3>
              <div className="mt-4 grid gap-3">
                <input
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  value={profileForm.first_name}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, first_name: e.target.value }))}
                  placeholder="First name"
                />
                <input
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  value={profileForm.last_name}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Last name"
                />
                <input
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone"
                />
                <button className="rounded-lg bg-accent px-4 py-2 text-white">Save Profile</button>
              </div>
            </form>

            <form onSubmit={handlePasswordUpdate} className="glass-card rounded-2xl p-5 shadow-glow">
              <h3 className="text-lg font-semibold text-primary">Change Password</h3>
              <div className="mt-4 grid gap-3">
                <input
                  type="password"
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Current password"
                />
                <input
                  type="password"
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="New password"
                />
                <button className="rounded-lg bg-primary px-4 py-2 text-white">Update Password</button>
              </div>
            </form>
          </div>
        )}

        {!loading && activeSection === 'Courses' && (
          <div className="grid gap-4 md:grid-cols-2">
            {courses.map((course) => (
              <article key={course.id} className="glass-card rounded-2xl p-5 shadow-glow">
                <h3 className="text-lg font-semibold text-primary">{course.title || course.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{course.description}</p>
                <p className="mt-3 text-base font-semibold text-slate-800">INR {Number(course.price || 0)}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {Number(course.price || 0) > 0 && (
                    <button
                      disabled={enrolledCourseIds.has(course.id)}
                      onClick={() => handleRazorpayBuy(course)}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                    >
                      {enrolledCourseIds.has(course.id) ? 'Enrolled' : 'Pay with Razorpay'}
                    </button>
                  )}
                  <button
                    disabled={enrolledCourseIds.has(course.id)}
                    onClick={() => handleFreeBuy(course.id)}
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {enrolledCourseIds.has(course.id) ? 'Enrolled' : 'Buy Free (Test)'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && activeSection === 'My Courses' && (
          <div className="grid gap-4 md:grid-cols-2">
            {myCourses.map((entry) => (
              <article key={entry.id} className="glass-card rounded-2xl p-5 shadow-glow">
                <h3 className="text-lg font-semibold text-primary">{entry.course?.name || entry.course?.title}</h3>
                <p className="mt-2 text-sm text-slate-600">Payment: {entry.payment_status}</p>
                <Link
                  to={`/dashboard/course/${entry.course?.id}`}
                  className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm text-white"
                >
                  Open Course
                </Link>
              </article>
            ))}
            {myCourses.length === 0 && <div className="glass-card rounded-2xl p-6">No purchased courses yet.</div>}
          </div>
        )}

        {!loading && activeSection === 'Notifications' && (
          <div className="space-y-3">
            {notifications.map((item) => (
              <article key={item.id} className="glass-card rounded-2xl p-4 shadow-glow">
                <h4 className="font-semibold text-primary">{item.title}</h4>
                <p className="text-sm text-slate-600">{item.message}</p>
              </article>
            ))}
            {notifications.length === 0 && <div className="glass-card rounded-2xl p-5">No notifications available.</div>}
          </div>
        )}

        {!loading && activeSection === 'Resources' && (
          <div className="grid gap-4 md:grid-cols-2">
            {resources.map((item) => (
              <article key={item.id} className="glass-card rounded-2xl p-4 shadow-glow">
                <p className="text-xs uppercase tracking-wide text-accent">{item.type}</p>
                <h4 className="mt-1 font-semibold text-primary">{item.title}</h4>
                {item.content_url && (
                  <a href={item.content_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm text-accent">
                    Open Resource
                  </a>
                )}
              </article>
            ))}
            {resources.length === 0 && <div className="glass-card rounded-2xl p-5">No resources available.</div>}
          </div>
        )}
      </motion.div>
    </section>
  );
}

export default DashboardPage;
