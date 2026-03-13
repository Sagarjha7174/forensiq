import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  BookOpen,
  LayoutDashboard,
  Library,
  Megaphone,
  Shield,
  UserCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  authService,
  courseService,
  enrollmentService,
  notificationService,
  resourceService
} from '../services/api';
import { getStoredUser, setAuthSession } from '../services/authStorage';
import AnimatedButton from '../components/ui/AnimatedButton';
import AnimatedCard from '../components/ui/AnimatedCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';

const sections = ['Dashboard', 'Profile', 'Courses', 'My Courses', 'Notifications', 'Resources'];
const sectionIcons = {
  Dashboard: LayoutDashboard,
  Profile: UserCircle,
  Courses: Library,
  'My Courses': BookOpen,
  Notifications: Bell,
  Resources: Shield
};

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
      <aside className="glass-card h-fit rounded-2xl p-4 shadow-glow md:sticky md:top-24">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Student Panel</p>
        <div className="space-y-2">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                activeSection === section
                  ? 'bg-gradient-to-r from-primary to-secondary text-white'
                  : 'bg-white/60 text-slate-700 hover:bg-slate-100 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {(() => {
                  const Icon = sectionIcons[section];
                  return Icon ? <Icon size={14} /> : null;
                })()}
                {section}
              </span>
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
        {loading && <LoadingSkeleton rows={5} className="h-48" />}

        {!loading && activeSection === 'Dashboard' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AnimatedCard className="p-5">
              <p className="text-sm text-slate-500 dark:text-slate-300">My Courses</p>
              <p className="mt-2 text-3xl font-bold text-primary">{myCourses.length}</p>
            </AnimatedCard>
            <AnimatedCard className="p-5" delay={0.03}>
              <p className="text-sm text-slate-500 dark:text-slate-300">Available Courses</p>
              <p className="mt-2 text-3xl font-bold text-primary">{courses.length}</p>
            </AnimatedCard>
            <AnimatedCard className="p-5" delay={0.05}>
              <p className="text-sm text-slate-500 dark:text-slate-300">Resources</p>
              <p className="mt-2 text-3xl font-bold text-primary">{resources.length}</p>
            </AnimatedCard>
            <AnimatedCard className="p-5" delay={0.08}>
              <p className="text-sm text-slate-500 dark:text-slate-300">Notifications</p>
              <p className="mt-2 text-3xl font-bold text-primary">{notifications.length}</p>
            </AnimatedCard>
          </div>
        )}

        {!loading && activeSection === 'Profile' && (
          <div className="grid gap-5 lg:grid-cols-2">
            <form onSubmit={handleProfileUpdate} className="glass-card rounded-2xl p-5 shadow-glow">
              <h3 className="text-lg font-semibold text-primary">Edit Profile</h3>
              <div className="mt-4 grid gap-3">
                <input
                  className="input-glow rounded-lg border border-slate-300 px-3 py-2 outline-none"
                  value={profileForm.first_name}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, first_name: e.target.value }))}
                  placeholder="First name"
                />
                <input
                  className="input-glow rounded-lg border border-slate-300 px-3 py-2 outline-none"
                  value={profileForm.last_name}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Last name"
                />
                <input
                  className="input-glow rounded-lg border border-slate-300 px-3 py-2 outline-none"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone"
                />
                <AnimatedButton variant="accent">Save Profile</AnimatedButton>
              </div>
            </form>

            <form onSubmit={handlePasswordUpdate} className="glass-card rounded-2xl p-5 shadow-glow">
              <h3 className="text-lg font-semibold text-primary">Change Password</h3>
              <div className="mt-4 grid gap-3">
                <input
                  type="password"
                  className="input-glow rounded-lg border border-slate-300 px-3 py-2 outline-none"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Current password"
                />
                <input
                  type="password"
                  className="input-glow rounded-lg border border-slate-300 px-3 py-2 outline-none"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="New password"
                />
                <AnimatedButton>Update Password</AnimatedButton>
              </div>
            </form>
          </div>
        )}

        {!loading && activeSection === 'Courses' && (
          <div className="grid gap-4 md:grid-cols-2">
            {courses.map((course) => (
              <AnimatedCard key={course.id} className="p-5">
                <h3 className="text-lg font-semibold text-primary">{course.title || course.name}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{course.description}</p>
                <p className="mt-3 text-base font-semibold text-slate-800 dark:text-slate-100">INR {Number(course.price || 0)}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {Number(course.price || 0) > 0 && (
                    <AnimatedButton
                      disabled={enrolledCourseIds.has(course.id)}
                      onClick={() => handleRazorpayBuy(course)}
                    >
                      {enrolledCourseIds.has(course.id) ? 'Enrolled' : 'Pay with Razorpay'}
                    </AnimatedButton>
                  )}
                  <AnimatedButton
                    disabled={enrolledCourseIds.has(course.id)}
                    onClick={() => handleFreeBuy(course.id)}
                    variant="accent"
                  >
                    {enrolledCourseIds.has(course.id) ? 'Enrolled' : 'Buy Free (Test)'}
                  </AnimatedButton>
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}

        {!loading && activeSection === 'My Courses' && (
          <div className="grid gap-4 md:grid-cols-2">
            {myCourses.map((entry) => (
              <AnimatedCard key={entry.id} className="p-5">
                <h3 className="text-lg font-semibold text-primary">{entry.course?.name || entry.course?.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Payment: {entry.payment_status}</p>
                <Link
                  to={`/dashboard/course/${entry.course?.id}`}
                  className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm text-white transition hover:bg-secondary"
                >
                  Open Course
                </Link>
              </AnimatedCard>
            ))}
            {myCourses.length === 0 && <AnimatedCard className="p-6">No purchased courses yet.</AnimatedCard>}
          </div>
        )}

        {!loading && activeSection === 'Notifications' && (
          <div className="space-y-3">
            {notifications.map((item) => (
              <AnimatedCard key={item.id} className="p-4">
                <h4 className="font-semibold text-primary">{item.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">{item.message}</p>
              </AnimatedCard>
            ))}
            {notifications.length === 0 && <AnimatedCard className="p-5">No notifications available.</AnimatedCard>}
          </div>
        )}

        {!loading && activeSection === 'Resources' && (
          <div className="grid gap-4 md:grid-cols-2">
            {resources.map((item) => (
              <AnimatedCard key={item.id} className="p-4">
                <p className="text-xs uppercase tracking-wide text-accent">{item.type}</p>
                <h4 className="mt-1 font-semibold text-primary">{item.title}</h4>
                {item.content_url && (
                  <a href={item.content_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm text-accent">
                    Open Resource
                  </a>
                )}
              </AnimatedCard>
            ))}
            {resources.length === 0 && <AnimatedCard className="p-5">No resources available.</AnimatedCard>}
          </div>
        )}
      </motion.div>
    </section>
  );
}

export default DashboardPage;
