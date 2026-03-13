import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  adminService,
  classService,
  courseService,
  notificationService,
  quizService,
  resourceService,
  workshopService
} from '../services/api';
import AnimatedButton from '../components/ui/AnimatedButton';
import AnimatedCard from '../components/ui/AnimatedCard';

function AdminPanelPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [resources, setResources] = useState([]);

  const [courseForm, setCourseForm] = useState({
    name: '',
    class_ids: [],
    description: '',
    price: '',
    thumbnail: ''
  });
  const [resourceForm, setResourceForm] = useState({
    title: '',
    type: 'lecture',
    course_id: '',
    order_index: 0,
    content_url: ''
  });
  const [quizForm, setQuizForm] = useState({
    title: '',
    course_id: '',
    timer_minutes: 30,
    question: '',
    options_csv: '',
    correct_option: ''
  });
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    class_id: '',
    course_id: ''
  });
  const [workshopForm, setWorkshopForm] = useState({ title: '', description: '', image: '', date: '' });

  const selectedCourse = useMemo(
    () => courses.find((c) => Number(c.id) === Number(quizForm.course_id)),
    [courses, quizForm.course_id]
  );

  const loadAll = async () => {
    try {
      const [statsRes, usersRes, classesRes, coursesRes, notificationsRes, resourcesRes, quizzesRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        classService.getClasses(),
        courseService.getCourses(),
        notificationService.getNotifications(),
        resourceService.getResources(),
        quizService.getQuizzes()
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data || []);
      setClasses(classesRes.data || []);
      setCourses(coursesRes.data || []);
      setNotifications(notificationsRes.data || []);
      setResources(resourcesRes.data || []);
      setQuizzes(quizzesRes.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load admin panel');
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const toggleCourseClass = (classId) => {
    setCourseForm((prev) => {
      const exists = prev.class_ids.includes(classId);
      return {
        ...prev,
        class_ids: exists ? prev.class_ids.filter((id) => id !== classId) : [...prev.class_ids, classId]
      };
    });
  };

  const createCourse = async (e) => {
    e.preventDefault();
    try {
      await courseService.createCourse({
        ...courseForm,
        class_ids: courseForm.class_ids,
        price: Number(courseForm.price || 0)
      });
      toast.success('Course created');
      setCourseForm({ name: '', class_ids: [], description: '', price: '', thumbnail: '' });
      await loadAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create course');
    }
  };

  const createResource = async (e) => {
    e.preventDefault();
    try {
      await resourceService.createResource({
        ...resourceForm,
        course_id: Number(resourceForm.course_id),
        order_index: Number(resourceForm.order_index || 0)
      });
      toast.success('Resource added');
      setResourceForm({ title: '', type: 'lecture', course_id: '', order_index: 0, content_url: '' });
      await loadAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create resource');
    }
  };

  const createQuiz = async (e) => {
    e.preventDefault();
    try {
      const options = quizForm.options_csv
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      await quizService.createQuiz({
        title: quizForm.title,
        course_id: Number(quizForm.course_id),
        timer_minutes: Number(quizForm.timer_minutes || 30),
        questions: [
          {
            question: quizForm.question,
            options,
            correct_option: quizForm.correct_option
          }
        ]
      });
      toast.success('Quiz created');
      setQuizForm({
        title: '',
        course_id: '',
        timer_minutes: 30,
        question: '',
        options_csv: '',
        correct_option: ''
      });
      await loadAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create quiz');
    }
  };

  const deleteQuiz = async (id) => {
    try {
      await quizService.deleteQuiz(id);
      toast.success('Quiz deleted');
      await loadAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete quiz');
    }
  };

  const createNotification = async (e) => {
    e.preventDefault();
    try {
      await notificationService.createNotification({
        ...notificationForm,
        class_id: notificationForm.class_id ? Number(notificationForm.class_id) : null,
        course_id: notificationForm.course_id ? Number(notificationForm.course_id) : null
      });
      toast.success('Notification created');
      setNotificationForm({ title: '', message: '', class_id: '', course_id: '' });
      await loadAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create notification');
    }
  };

  const createWorkshop = async (e) => {
    e.preventDefault();
    try {
      await workshopService.createWorkshop(workshopForm);
      toast.success('Workshop created');
      setWorkshopForm({ title: '', description: '', image: '', date: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create workshop');
    }
  };

  const deleteUser = async (id) => {
    try {
      await adminService.deleteUser(id);
      toast.success('User deleted');
      await loadAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete user');
    }
  };

  return (
    <section className="mt-8 space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 font-heading text-3xl text-primary"
      >
        <ShieldCheck size={26} />
        Admin Panel
      </motion.h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatedCard className="p-4" hover={false}><p className="text-sm text-slate-500">Total Users</p><p className="text-2xl font-bold text-primary">{stats?.totalUsers || 0}</p></AnimatedCard>
        <AnimatedCard className="p-4" hover={false}><p className="text-sm text-slate-500">Total Courses</p><p className="text-2xl font-bold text-primary">{stats?.totalCourses || 0}</p></AnimatedCard>
        <AnimatedCard className="p-4" hover={false}><p className="text-sm text-slate-500">Enrollments</p><p className="text-2xl font-bold text-primary">{stats?.totalEnrollments || 0}</p></AnimatedCard>
        <AnimatedCard className="p-4" hover={false}><p className="text-sm text-slate-500">Revenue</p><p className="text-2xl font-bold text-primary">INR {stats?.totalRevenue || 0}</p></AnimatedCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={createCourse} className="glass-card rounded-2xl p-5 shadow-glow space-y-3">
          <h2 className="text-lg font-semibold text-primary">Course Management</h2>
          <input value={courseForm.name} onChange={(e) => setCourseForm((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-lg border px-3 py-2" placeholder="Course title" required />
          <div className="rounded-lg border p-3">
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Assign Classes (multi-select)</p>
            <div className="grid gap-2 md:grid-cols-2">
              {classes.map((item) => (
                <label key={item.id} className="flex items-center gap-2 text-sm dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={courseForm.class_ids.includes(item.id)}
                    onChange={() => toggleCourseClass(item.id)}
                  />
                  {item.name}
                </label>
              ))}
            </div>
          </div>
          <textarea value={courseForm.description} onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))} className="w-full rounded-lg border px-3 py-2" placeholder="Description" required />
          <input type="number" value={courseForm.price} onChange={(e) => setCourseForm((p) => ({ ...p, price: e.target.value }))} className="w-full rounded-lg border px-3 py-2" placeholder="Price" required />
          <input value={courseForm.thumbnail} onChange={(e) => setCourseForm((p) => ({ ...p, thumbnail: e.target.value }))} className="w-full rounded-lg border px-3 py-2" placeholder="Thumbnail URL" />
          <AnimatedButton type="submit" variant="accent">Create Course</AnimatedButton>
        </form>

        <form onSubmit={createResource} className="glass-card rounded-2xl p-5 shadow-glow space-y-3">
          <h2 className="text-lg font-semibold text-primary">Resource Management</h2>
          <input value={resourceForm.title} onChange={(e) => setResourceForm((p) => ({ ...p, title: e.target.value }))} className="w-full rounded-lg border px-3 py-2" placeholder="Resource title" required />
          <select value={resourceForm.type} onChange={(e) => setResourceForm((p) => ({ ...p, type: e.target.value }))} className="w-full rounded-lg border px-3 py-2">
            <option value="lecture">Lecture</option>
            <option value="pdf">PDF</option>
            <option value="quiz">Quiz</option>
            <option value="announcement">Announcement</option>
          </select>
          <select value={resourceForm.course_id} onChange={(e) => setResourceForm((p) => ({ ...p, course_id: e.target.value }))} className="w-full rounded-lg border px-3 py-2" required>
            <option value="">Select course</option>
            {courses.map((item) => <option key={item.id} value={item.id}>{item.name || item.title}</option>)}
          </select>
          <input type="number" value={resourceForm.order_index} onChange={(e) => setResourceForm((p) => ({ ...p, order_index: e.target.value }))} className="w-full rounded-lg border px-3 py-2" placeholder="Lecture order" />
          <input value={resourceForm.content_url} onChange={(e) => setResourceForm((p) => ({ ...p, content_url: e.target.value }))} className="w-full rounded-lg border px-3 py-2" placeholder="Content URL" />
          <AnimatedButton type="submit">Add Resource</AnimatedButton>
        </form>

        <form onSubmit={createQuiz} className="glass-card rounded-2xl p-5 shadow-glow space-y-3">
          <h2 className="text-lg font-semibold text-primary">Quiz Management (Course-specific)</h2>
          <input value={quizForm.title} onChange={(e) => setQuizForm((p) => ({ ...p, title: e.target.value }))} className="w-full rounded-lg border px-3 py-2" placeholder="Quiz title" required />
          <select value={quizForm.course_id} onChange={(e) => setQuizForm((p) => ({ ...p, course_id: e.target.value }))} className="w-full rounded-lg border px-3 py-2" required>
            <option value="">Select course</option>
            {courses.map((item) => <option key={item.id} value={item.id}>{item.name || item.title}</option>)}
          </select>
          {selectedCourse && (
            <p className="rounded-lg bg-white/70 p-2 text-xs text-slate-600 dark:bg-slate-900/80 dark:text-slate-300">
              Quiz will be visible in course: <span className="font-medium">{selectedCourse.name || selectedCourse.title}</span>
            </p>
          )}
          <input type="number" value={quizForm.timer_minutes} onChange={(e) => setQuizForm((p) => ({ ...p, timer_minutes: e.target.value }))} className="w-full rounded-lg border px-3 py-2" placeholder="Timer (minutes)" />
          <textarea value={quizForm.question} onChange={(e) => setQuizForm((p) => ({ ...p, question: e.target.value }))} className="w-full rounded-lg border px-3 py-2" placeholder="Question" required />
          <input value={quizForm.options_csv} onChange={(e) => setQuizForm((p) => ({ ...p, options_csv: e.target.value }))} className="w-full rounded-lg border px-3 py-2" placeholder="Options comma-separated" required />
          <input value={quizForm.correct_option} onChange={(e) => setQuizForm((p) => ({ ...p, correct_option: e.target.value }))} className="w-full rounded-lg border px-3 py-2" placeholder="Correct option" required />
          <AnimatedButton type="submit" variant="accent">Create Quiz</AnimatedButton>
        </form>

        <form onSubmit={createNotification} className="glass-card rounded-2xl p-5 shadow-glow space-y-3">
          <h2 className="text-lg font-semibold text-primary">Notification Management</h2>
          <input value={notificationForm.title} onChange={(e) => setNotificationForm((p) => ({ ...p, title: e.target.value }))} className="w-full rounded-lg border px-3 py-2" placeholder="Title" required />
          <textarea value={notificationForm.message} onChange={(e) => setNotificationForm((p) => ({ ...p, message: e.target.value }))} className="w-full rounded-lg border px-3 py-2" placeholder="Message" required />
          <select value={notificationForm.class_id} onChange={(e) => setNotificationForm((p) => ({ ...p, class_id: e.target.value }))} className="w-full rounded-lg border px-3 py-2">
            <option value="">Visible class (optional)</option>
            {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select value={notificationForm.course_id} onChange={(e) => setNotificationForm((p) => ({ ...p, course_id: e.target.value }))} className="w-full rounded-lg border px-3 py-2">
            <option value="">Visible course (optional)</option>
            {courses.map((item) => <option key={item.id} value={item.id}>{item.name || item.title}</option>)}
          </select>
          <AnimatedButton type="submit">Create Notification</AnimatedButton>
        </form>

        <form onSubmit={createWorkshop} className="glass-card rounded-2xl p-5 shadow-glow space-y-3 lg:col-span-2">
          <h2 className="text-lg font-semibold text-primary">Workshops</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <input value={workshopForm.title} onChange={(e) => setWorkshopForm((p) => ({ ...p, title: e.target.value }))} className="rounded-lg border px-3 py-2" placeholder="Workshop title" required />
            <input type="datetime-local" value={workshopForm.date} onChange={(e) => setWorkshopForm((p) => ({ ...p, date: e.target.value }))} className="rounded-lg border px-3 py-2" required />
            <input value={workshopForm.image} onChange={(e) => setWorkshopForm((p) => ({ ...p, image: e.target.value }))} className="rounded-lg border px-3 py-2" placeholder="Image URL" required />
            <input value={workshopForm.description} onChange={(e) => setWorkshopForm((p) => ({ ...p, description: e.target.value }))} className="rounded-lg border px-3 py-2" placeholder="Description" required />
          </div>
          <AnimatedButton type="submit" variant="accent">Create Workshop</AnimatedButton>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-card rounded-2xl p-5 shadow-glow">
          <h2 className="text-lg font-semibold text-primary">Existing Quizzes</h2>
          <div className="mt-3 space-y-2">
            {quizzes.slice(0, 10).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg bg-white/70 p-3 text-sm dark:bg-slate-900/80">
                <div>
                  <p className="font-medium text-primary">{item.title}</p>
                  <p className="text-slate-600 dark:text-slate-300">{item.course?.name || 'Course not found'}</p>
                </div>
                <button onClick={() => deleteQuiz(item.id)} className="rounded bg-rose-500 px-3 py-1 text-white">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5 shadow-glow">
          <h2 className="text-lg font-semibold text-primary">Recent Resources</h2>
          <div className="mt-3 space-y-2">
            {resources.slice(0, 6).map((item) => (
              <div key={item.id} className="rounded-lg bg-white/70 p-3 text-sm dark:bg-slate-900/80">
                <p className="font-medium text-primary">{item.title}</p>
                <p className="text-slate-600 uppercase dark:text-slate-300">{item.type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5 shadow-glow">
        <h2 className="text-lg font-semibold text-primary">Users</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-300">
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Role</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id} className="border-t border-slate-200 dark:border-slate-700 dark:text-slate-200">
                  <td className="py-2">{item.first_name} {item.last_name}</td>
                  <td className="py-2">{item.email}</td>
                  <td className="py-2">{item.role}</td>
                  <td className="py-2">
                    {item.role !== 'admin' && (
                      <button onClick={() => deleteUser(item.id)} className="rounded bg-rose-500 px-3 py-1 text-white">
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default AdminPanelPage;
