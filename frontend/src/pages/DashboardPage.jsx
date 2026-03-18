import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bell,
  BookOpen,
  BookOpenCheck,
  Clock3,
  LayoutDashboard,
  Library,
  LogOut,
  Shield,
  UserCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  authService,
  courseService,
  enrollmentService,
  notificationService,
  progressService,
  resourceService
  ,workshopService
} from '../services/api';
import { clearAuthSession, getStoredUser, setAuthSession } from '../services/authStorage';
import AnimatedButton from '../components/ui/AnimatedButton';
import AnimatedCard from '../components/ui/AnimatedCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';

const sections = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'courses', label: 'Courses', icon: Library },
  { key: 'my-courses', label: 'My Courses', icon: BookOpen },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'profile', label: 'Profile', icon: UserCircle }
];

const getCourseTitle = (course) => course?.title || course?.name || 'Untitled Course';
const clampProgress = (value) => Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));

function DashboardPage() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [resources, setResources] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [progressRows, setProgressRows] = useState([]);
  const [sendingTestMail, setSendingTestMail] = useState(false);

  const user = getStoredUser();

  const initLoad = async () => {
    try {
      setLoading(true);
      const [profileRes, coursesRes, myCoursesRes, notiRes, resourcesRes, workshopsRes, progressRes] = await Promise.all([
        authService.profile(),
        courseService.getCourses({ class_id: user?.class_id }),
        enrollmentService.getMyCourses(),
        notificationService.getNotifications(),
        resourceService.getResources(),
        workshopService.getWorkshops(),
        progressService.getProgress()
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
      setWorkshops(workshopsRes.data || []);
      setProgressRows(progressRes.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initLoad();
  }, []);

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (sections.some((section) => section.key === hash)) {
      setActiveSection(hash);
    }
  }, [location.hash]);

  const enrolledCourseIds = useMemo(
    () => new Set(myCourses.map((entry) => entry.course?.id).filter(Boolean)),
    [myCourses]
  );

  const lectureStatsByCourse = useMemo(() => {
    const completedResourceIds = new Set(
      progressRows.filter((row) => row.completed).map((row) => row.resource_id)
    );
    const stats = new Map();

    resources
      .filter((resource) => resource.type === 'lecture')
      .forEach((resource) => {
        const current = stats.get(resource.course_id) || { total: 0, completed: 0 };
        current.total += 1;
        if (completedResourceIds.has(resource.id)) {
          current.completed += 1;
        }
        stats.set(resource.course_id, current);
      });

    return stats;
  }, [progressRows, resources]);

  const learningCards = useMemo(
    () =>
      myCourses.map((entry) => {
        const course = entry.course || {};
        const stats = lectureStatsByCourse.get(course.id) || { total: 0, completed: 0 };
        const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
        return {
          ...entry,
          course,
          progress: clampProgress(progress),
          completedLectures: stats.completed,
          totalLectures: stats.total
        };
      }),
    [lectureStatsByCourse, myCourses]
  );

  const recommendedCourses = useMemo(
    () => courses.filter((course) => !enrolledCourseIds.has(course.id)).slice(0, 6),
    [courses, enrolledCourseIds]
  );

  const upcomingWorkshops = useMemo(() => workshops.slice(0, 4), [workshops]);
  const recentCourses = useMemo(() => learningCards.slice(0, 3), [learningCards]);
  const featuredResources = useMemo(() => resources.slice(0, 4), [resources]);

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
        theme: { color: '#4F46E5' }
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

  const handleSendTestMail = async () => {
    try {
      setSendingTestMail(true);
      const response = await authService.sendTestMail();
      toast.success(response.data?.message || 'Test email sent');
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout - backend is taking too long. Please try again.');
      } else {
        toast.error(error.response?.data?.message || 'Test email failed');
      }
    } finally {
      setSendingTestMail(false);
    }
  };

  const handleSectionChange = (sectionKey) => {
    setActiveSection(sectionKey);
    const nextUrl = sectionKey === 'dashboard' ? '/dashboard' : `/dashboard#${sectionKey}`;
    window.history.replaceState(null, '', nextUrl);
  };

  const handleLogout = () => {
    clearAuthSession();
    window.location.href = '/';
  };

  const inputClassName =
    'rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.2)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

  return (
    <section className="mx-auto max-w-7xl px-6 py-8 lg:py-12">
      <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
        <aside className="glass-card h-fit rounded-xl p-5 xl:sticky xl:top-24">
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">Student Panel</p>
            <h2 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
              {profile?.first_name ? `Welcome, ${profile.first_name}` : 'Welcome back'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Keep learning with cleaner navigation, progress tracking, and quick access to your key sections.
            </p>
          </div>

          <div className="mt-5 space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const selected = activeSection === section.key;
              return (
                <button
                  key={section.key}
                  onClick={() => handleSectionChange(section.key)}
                  className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                    selected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="inline-flex items-center gap-3">
                    <Icon size={16} />
                    {section.label}
                  </span>
                  <ArrowRight size={14} className={selected ? 'opacity-100' : 'opacity-50'} />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/20 dark:hover:bg-rose-950/40"
          >
            <LogOut size={16} />
            Logout
          </button>
        </aside>

        <div className="space-y-6">
          <div className="glass-card overflow-hidden rounded-xl p-6 md:p-8">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Learning Overview
                </div>
                <h1 className="mt-5 font-heading text-4xl font-bold text-slate-900 dark:text-white md:text-5xl">
                  Your learning dashboard
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
                  Continue learning, discover recommended courses, track lecture completion, and stay on top of workshops from a clearer dashboard layout.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[360px]">
                {[
                  { label: 'Enrolled', value: learningCards.length },
                  { label: 'Notifications', value: notifications.length },
                  { label: 'Resources', value: resources.length }
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                    <p className="text-2xl font-semibold text-slate-900 dark:text-white">{item.value}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {loading && <LoadingSkeleton rows={6} className="h-56" />}

            {!loading && activeSection === 'dashboard' && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: 'Continue Learning', value: learningCards.length, icon: BookOpenCheck },
                    { label: 'Recommended', value: recommendedCourses.length, icon: Library },
                    { label: 'Upcoming Workshops', value: upcomingWorkshops.length, icon: Clock3 },
                    { label: 'Resource Library', value: featuredResources.length, icon: Shield }
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <AnimatedCard key={item.label} className="p-5">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                          <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-slate-700 dark:text-indigo-300">
                            <Icon size={16} />
                          </span>
                        </div>
                        <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{item.value}</p>
                      </AnimatedCard>
                    );
                  })}
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
                  <AnimatedCard className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Continue Learning</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Progress bars are calculated from completed lecture resources.</p>
                      </div>
                    </div>
                    <div className="mt-6 space-y-4">
                      {learningCards.slice(0, 3).map((entry) => (
                        <div key={entry.id} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{getCourseTitle(entry.course)}</h4>
                              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                                {entry.completedLectures} of {entry.totalLectures} lectures completed
                              </p>
                            </div>
                            <Link to={`/dashboard/course/${entry.course?.id}`}>
                              <AnimatedButton variant="accent">Resume Course</AnimatedButton>
                            </Link>
                          </div>
                          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                            <div className="h-full rounded-full bg-indigo-600" style={{ width: `${entry.progress}%` }} />
                          </div>
                          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
                            {entry.progress}% complete
                          </p>
                        </div>
                      ))}
                      {learningCards.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-300">No enrolled courses yet.</p>}
                    </div>
                  </AnimatedCard>

                  <AnimatedCard className="p-6">
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Upcoming Workshops</h3>
                    <div className="mt-6 grid gap-4">
                      {upcomingWorkshops.map((workshop) => (
                        <div key={workshop.id} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                          <p className="text-xs uppercase tracking-[0.14em] text-teal-600 dark:text-teal-400">
                            {new Date(workshop.date).toLocaleDateString()}
                          </p>
                          <h4 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{workshop.title}</h4>
                          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{workshop.description}</p>
                        </div>
                      ))}
                      {upcomingWorkshops.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-300">No upcoming workshops available.</p>}
                    </div>
                  </AnimatedCard>
                </div>

                <AnimatedCard className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Recommended Courses</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">A horizontal strip for quick course discovery.</p>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
                    {recommendedCourses.map((course) => (
                      <div key={course.id} className="min-w-[280px] max-w-[320px] flex-1 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{getCourseTitle(course)}</h4>
                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{course.description}</p>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {Number(course.price || 0) > 0 ? `INR ${Number(course.price || 0)}` : 'Free'}
                          </p>
                          {Number(course.price || 0) > 0 ? (
                            <AnimatedButton onClick={() => handleRazorpayBuy(course)}>Buy</AnimatedButton>
                          ) : (
                            <AnimatedButton variant="accent" onClick={() => handleFreeBuy(course.id)}>
                              Enroll Free
                            </AnimatedButton>
                          )}
                        </div>
                      </div>
                    ))}
                    {recommendedCourses.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-300">All available courses are already in your library.</p>}
                  </div>
                </AnimatedCard>

                <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                  <AnimatedCard className="p-6">
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Recently Viewed</h3>
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      {recentCourses.map((entry) => (
                        <div key={entry.id} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                          <h4 className="text-base font-semibold text-slate-900 dark:text-white">{getCourseTitle(entry.course)}</h4>
                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Payment: {entry.payment_status}</p>
                          <Link to={`/dashboard/course/${entry.course?.id}`} className="mt-4 inline-flex text-sm font-semibold text-indigo-600 dark:text-indigo-300">
                            Open Course
                          </Link>
                        </div>
                      ))}
                      {recentCourses.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-300">Your recent courses will appear here.</p>}
                    </div>
                  </AnimatedCard>

                  <AnimatedCard className="p-6">
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Resource Highlights</h3>
                    <div className="mt-6 space-y-4">
                      {featuredResources.map((item) => (
                        <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                          <p className="text-xs uppercase tracking-[0.14em] text-teal-600 dark:text-teal-400">{item.type}</p>
                          <h4 className="mt-2 text-base font-semibold text-slate-900 dark:text-white">{item.title}</h4>
                          {item.content_url && (
                            <a href={item.content_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-semibold text-indigo-600 dark:text-indigo-300">
                              Open Resource
                            </a>
                          )}
                        </div>
                      ))}
                      {featuredResources.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-300">No resources available yet.</p>}
                    </div>
                  </AnimatedCard>
                </div>
              </>
            )}

            {!loading && activeSection === 'courses' && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                  <AnimatedCard key={course.id} className="flex h-full flex-col p-5">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{getCourseTitle(course)}</h3>
                    <p className="mt-3 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{course.description}</p>
                    <p className="mt-4 text-base font-semibold text-slate-800 dark:text-slate-100">INR {Number(course.price || 0)}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {Number(course.price || 0) > 0 && (
                        <AnimatedButton disabled={enrolledCourseIds.has(course.id)} onClick={() => handleRazorpayBuy(course)}>
                          {enrolledCourseIds.has(course.id) ? 'Enrolled' : 'Pay with Razorpay'}
                        </AnimatedButton>
                      )}
                      <AnimatedButton disabled={enrolledCourseIds.has(course.id)} onClick={() => handleFreeBuy(course.id)} variant="accent">
                        {enrolledCourseIds.has(course.id) ? 'Enrolled' : 'Buy Free'}
                      </AnimatedButton>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            )}

            {!loading && activeSection === 'my-courses' && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {learningCards.map((entry) => (
                  <AnimatedCard key={entry.id} className="p-5">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{getCourseTitle(entry.course)}</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Payment: {entry.payment_status}</p>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div className="h-full rounded-full bg-indigo-600" style={{ width: `${entry.progress}%` }} />
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">{entry.progress}% complete</p>
                    <Link to={`/dashboard/course/${entry.course?.id}`} className="mt-4 inline-flex">
                      <AnimatedButton variant="primary">Open Course</AnimatedButton>
                    </Link>
                  </AnimatedCard>
                ))}
                {learningCards.length === 0 && <AnimatedCard className="p-6">No purchased courses yet.</AnimatedCard>}
              </div>
            )}

            {!loading && activeSection === 'notifications' && (
              <div className="space-y-3">
                {notifications.map((item) => (
                  <AnimatedCard key={item.id} className="p-5">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.message}</p>
                  </AnimatedCard>
                ))}
                {notifications.length === 0 && <AnimatedCard className="p-5">No notifications available.</AnimatedCard>}
              </div>
            )}

            {!loading && activeSection === 'resources' && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {resources.map((item) => (
                  <AnimatedCard key={item.id} className="p-5">
                    <p className="text-xs uppercase tracking-[0.14em] text-teal-600 dark:text-teal-400">{item.type}</p>
                    <h4 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h4>
                    {item.content_url && (
                      <a href={item.content_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-semibold text-indigo-600 dark:text-indigo-300">
                        Open Resource
                      </a>
                    )}
                  </AnimatedCard>
                ))}
                {resources.length === 0 && <AnimatedCard className="p-5">No resources available.</AnimatedCard>}
              </div>
            )}

            {!loading && activeSection === 'profile' && (
              <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
                <AnimatedCard className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Profile Snapshot</h3>
                    <AnimatedButton
                      type="button"
                      variant="ghost"
                      loading={sendingTestMail}
                      onClick={handleSendTestMail}
                    >
                      Test Mail
                    </AnimatedButton>
                  </div>
                  <div className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Name</p>
                      <p className="mt-1 text-base font-medium text-slate-900 dark:text-white">
                        {profile?.first_name} {profile?.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Email</p>
                      <p className="mt-1 text-base font-medium text-slate-900 dark:text-white">{profile?.email}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Phone</p>
                      <p className="mt-1 text-base font-medium text-slate-900 dark:text-white">{profile?.phone || 'Not added yet'}</p>
                    </div>
                  </div>
                </AnimatedCard>

                <div className="grid gap-5 lg:grid-cols-2">
                  <form onSubmit={handleProfileUpdate} className="glass-card rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Edit Profile</h3>
                    <div className="mt-5 grid gap-3">
                      <input
                        className={inputClassName}
                        value={profileForm.first_name}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, first_name: e.target.value }))}
                        placeholder="First name"
                      />
                      <input
                        className={inputClassName}
                        value={profileForm.last_name}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, last_name: e.target.value }))}
                        placeholder="Last name"
                      />
                      <input
                        className={inputClassName}
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="Phone"
                      />
                      <AnimatedButton variant="primary">Save Profile</AnimatedButton>
                    </div>
                  </form>

                  <form onSubmit={handlePasswordUpdate} className="glass-card rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Change Password</h3>
                    <div className="mt-5 grid gap-3">
                      <input
                        type="password"
                        className={inputClassName}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Current password"
                      />
                      <input
                        type="password"
                        className={inputClassName}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="New password"
                      />
                      <AnimatedButton>Update Password</AnimatedButton>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;
