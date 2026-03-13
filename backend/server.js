const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const workshopRoutes = require('./routes/workshopRoutes');
const classRoutes = require('./routes/classRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const quizRoutes = require('./routes/quizRoutes');
const progressRoutes = require('./routes/progressRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const { getMyCourses } = require('./controllers/enrollmentController');
const Course = require('./models/Course');
const ClassModel = require('./models/ClassModel');
const Notification = require('./models/Notification');
const Workshop = require('./models/Workshop');
const User = require('./models/User');
const Enrollment = require('./models/Enrollment');
const Resource = require('./models/Resource');
const Quiz = require('./models/Quiz');
const QuizQuestion = require('./models/QuizQuestion');
const LectureProgress = require('./models/LectureProgress');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [])
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'ForensIQ API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/enroll', enrollmentRoutes);
app.get('/api/my-courses', authMiddleware, getMyCourses);
app.use('/api/resources', resourceRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);

ClassModel.hasMany(Course, { foreignKey: 'class_id', as: 'courses' });
Course.belongsTo(ClassModel, { foreignKey: 'class_id', as: 'class' });

ClassModel.hasMany(User, { foreignKey: 'class_id', as: 'students' });
User.belongsTo(ClassModel, { foreignKey: 'class_id', as: 'class' });
Course.hasMany(User, { foreignKey: 'course_id', as: 'users' });
User.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

User.hasMany(Enrollment, { foreignKey: 'user_id', as: 'enrollments' });
Enrollment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Course.hasMany(Enrollment, { foreignKey: 'course_id', as: 'enrollments' });
Enrollment.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

Course.hasMany(Resource, { foreignKey: 'course_id', as: 'resources' });
Resource.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

Quiz.hasMany(QuizQuestion, { foreignKey: 'quiz_id', as: 'questions' });
QuizQuestion.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });

const seedData = async () => {
  const classCount = await ClassModel.count();
  if (classCount === 0) {
    await ClassModel.bulkCreate([
      { name: 'XIIth' },
      { name: 'UG (Undergraduate)' },
      { name: 'PG (Postgraduate)' },
      { name: 'Dropout' }
    ]);
  }

  const classes = await ClassModel.findAll({ order: [['id', 'ASC']] });
  const pgClass = classes.find((item) => item.name.includes('PG')) || classes[0];
  const ugClass = classes.find((item) => item.name.includes('UG')) || classes[0];

  const courseCount = await Course.count();
  if (courseCount === 0) {
    await Course.bulkCreate([
      {
        name: 'Mock test only - MA Criminology CUET',
        class_id: pgClass.id,
        description: 'Focused mock test package with exam-like practice sets.',
        price: 1999,
        thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80'
      },
      {
        name: 'CUET M.Sc Psychology (Forensic/Neuro/Clinical)',
        class_id: pgClass.id,
        description: 'Comprehensive prep for M.Sc Psychology CUET pathways.',
        price: 6999,
        thumbnail: 'https://images.unsplash.com/photo-1573496799515-eebbb63814f2?auto=format&fit=crop&w=1200&q=80'
      },
      {
        name: 'CUET M.Sc Cyber Security / DFIS',
        class_id: pgClass.id,
        description: 'Cyber security and digital forensics intensive preparation track.',
        price: 7499,
        thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80'
      },
      {
        name: 'Mock test only - MSc Forensic Science',
        class_id: pgClass.id,
        description: 'Practice-first package with score analytics and instant feedback.',
        price: 2499,
        thumbnail: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=1200&q=80'
      },
      {
        name: 'CUET MA Criminology',
        class_id: pgClass.id,
        description: 'Concept + case-study based preparation for criminology entrance.',
        price: 6499,
        thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80'
      },
      {
        name: 'Mock test only - MSc Psychology',
        class_id: pgClass.id,
        description: 'Timed tests and solution walkthroughs for psychology aspirants.',
        price: 1999,
        thumbnail: 'https://images.unsplash.com/photo-1573496799515-eebbb63814f2?auto=format&fit=crop&w=1200&q=80'
      },
      {
        name: 'Mock test only - MSc Cyber / DFIS',
        class_id: pgClass.id,
        description: 'Cyber and DFIS mock exams aligned with latest CUET pattern.',
        price: 2299,
        thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80'
      },
      {
        name: 'CUET UG BSC (Forensic / Criminology)',
        class_id: ugClass.id,
        description: 'Strong foundation for UG aspirants with topic-wise guidance and practice.',
        price: 4999,
        thumbnail: 'https://images.unsplash.com/photo-1581093803931-46e730e7622e?auto=format&fit=crop&w=1200&q=80'
      },
      {
        name: 'CUET PG MSc Forensic Science (All specializations)',
        class_id: pgClass.id,
        description: 'Advanced preparation for CUET PG with expert mentorship and mock tests.',
        price: 6999,
        thumbnail: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=1200&q=80'
      },
      {
        name: 'Other',
        class_id: pgClass.id,
        description: 'Custom counseling-based preparation track.',
        price: 0,
        thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80'
      }
    ]);
  }

  const firstCourse = await Course.findOne({ order: [['id', 'ASC']] });

  const adminCount = await User.count({ where: { role: 'admin' } });
  if (adminCount === 0 && firstCourse) {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    await User.create({
      first_name: 'Platform',
      last_name: 'Admin',
      email: 'admin@forensiq.com',
      phone: '9000000000',
      password: hashedPassword,
      class_id: firstCourse.class_id,
      course_id: firstCourse.id,
      role: 'admin'
    });
  }

  const resourceCount = await Resource.count();
  if (resourceCount === 0 && firstCourse) {
    await Resource.bulkCreate([
      {
        title: 'Introduction to Investigative Thinking',
        type: 'lecture',
        course_id: firstCourse.id,
        class_id: firstCourse.class_id,
        content_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        title: 'Evidence Handling Notes',
        type: 'pdf',
        course_id: firstCourse.id,
        class_id: firstCourse.class_id,
        content_url: 'https://example.com/notes.pdf'
      }
    ]);
  }

  const workshopCount = await Workshop.count();
  if (workshopCount === 0) {
    await Workshop.bulkCreate([
      {
        title: 'Digital Forensics Bootcamp',
        description: 'Hands-on workshop on evidence handling, tools, and cyber investigations.',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        date: new Date()
      }
    ]);
  }

  const notificationCount = await Notification.count();
  if (notificationCount === 0) {
    await Notification.create({
      title: 'Welcome to ForensIQ',
      message: 'Admissions are open for upcoming CUET batches.',
      class_id: null,
      course_id: null
    });
  }
};

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    await seedData();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to database:', error.message);
    process.exit(1);
  }
};

startServer();
