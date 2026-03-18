import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const normalizedApiUrl = /\/api\/?$/i.test(rawApiUrl)
  ? rawApiUrl.replace(/\/$/, '')
  : `${rawApiUrl.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL: normalizedApiUrl
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  profile: () => api.get('/auth/profile'),
  updateProfile: (payload) => api.put('/auth/profile', payload),
  changePassword: (payload) => api.put('/auth/change-password', payload),
  sendTestMail: () => api.post('/auth/test-mail')
};

export const courseService = {
  getCourses: (params) => api.get('/courses', { params }),
  createCourse: (payload) => api.post('/courses', payload),
  updateCourse: (id, payload) => api.put(`/courses/${id}`, payload),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  getCourseById: (id) => api.get(`/courses/${id}`)
};

export const classService = {
  getClasses: () => api.get('/classes'),
  createClass: (payload) => api.post('/classes', payload)
};

export const enrollmentService = {
  createOrder: (payload) => api.post('/enroll/create-order', payload),
  verifyPayment: (payload) => api.post('/enroll/verify', payload),
  enrollFree: (payload) => api.post('/enroll/free', payload),
  getMyCourses: () => api.get('/my-courses')
};

export const resourceService = {
  getResources: (params) => api.get('/resources', { params }),
  createResource: (payload) => api.post('/resources', payload)
};

export const quizService = {
  getQuizzes: (params) => api.get('/quizzes', { params }),
  createQuiz: (payload) => api.post('/quizzes', payload),
  deleteQuiz: (id) => api.delete(`/quizzes/${id}`)
};

export const quizAttemptService = {
  submitAttempt: (payload) => api.post('/quiz-attempts/submit', payload),
  getHistory: (params) => api.get('/quiz-attempts/history', { params })
};

export const progressService = {
  getProgress: () => api.get('/progress'),
  markCompleted: (payload) => api.post('/progress/complete', payload)
};

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  createNotification: (payload) => api.post('/notifications', payload),
  updateNotification: (id, payload) => api.put(`/notifications/${id}`, payload),
  deleteNotification: (id) => api.delete(`/notifications/${id}`)
};

export const workshopService = {
  getWorkshops: () => api.get('/workshops'),
  createWorkshop: (payload) => api.post('/workshops', payload)
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/user/${id}`)
};

export default api;
