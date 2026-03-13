const express = require('express');
const cors = require('cors');
const { execSync } = require('child_process');
const dotenv = require('dotenv');
const sequelize = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const quizRoutes = require('./routes/quizRoutes');
const quizAttemptRoutes = require('./routes/quizAttemptRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const progressRoutes = require('./routes/progressRoutes');
const workshopRoutes = require('./routes/workshopRoutes');
const adminRoutes = require('./routes/adminRoutes');

const authMiddleware = require('./middleware/authMiddleware');
const { getMyCourses } = require('./controllers/enrollmentController');

const ClassModel = require('./models/ClassModel');
const Course = require('./models/Course');
const CourseClass = require('./models/CourseClass');
const User = require('./models/User');
const Enrollment = require('./models/Enrollment');
const Resource = require('./models/Resource');
const Quiz = require('./models/Quiz');
const QuizQuestion = require('./models/QuizQuestion');
const QuizAttempt = require('./models/QuizAttempt');
const LectureProgress = require('./models/LectureProgress');
const Notification = require('./models/Notification');
const Workshop = require('./models/Workshop');

const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'https://forensiq-six.vercel.app',
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [])
];

app.use(
  cors({
    origin(origin, callback) {
      let isAllowedVercelPreview = false;
      if (typeof origin === 'string') {
        try {
          isAllowedVercelPreview = /\.vercel\.app$/i.test(new URL(origin).hostname);
        } catch {
          isAllowedVercelPreview = false;
        }
      }
      if (!origin || allowedOrigins.includes(origin) || isAllowedVercelPreview) return callback(null, true);
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
app.use('/api/enroll', enrollmentRoutes);
app.get('/api/my-courses', authMiddleware, getMyCourses);
app.use('/api/resources', resourceRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/quiz-attempts', quizAttemptRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/admin', adminRoutes);

ClassModel.belongsToMany(Course, {
  through: CourseClass,
  foreignKey: 'class_id',
  otherKey: 'course_id',
  as: 'courses'
});
Course.belongsToMany(ClassModel, {
  through: CourseClass,
  foreignKey: 'course_id',
  otherKey: 'class_id',
  as: 'classes'
});

ClassModel.hasMany(User, { foreignKey: 'class_id', as: 'students' });
User.belongsTo(ClassModel, { foreignKey: 'class_id', as: 'class' });

User.hasMany(Enrollment, { foreignKey: 'user_id', as: 'enrollments' });
Enrollment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Course.hasMany(Enrollment, { foreignKey: 'course_id', as: 'enrollments' });
Enrollment.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

Course.hasMany(Resource, { foreignKey: 'course_id', as: 'resources' });
Resource.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

Course.hasMany(Quiz, { foreignKey: 'course_id', as: 'quizzes' });
Quiz.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
Quiz.hasMany(QuizQuestion, { foreignKey: 'quiz_id', as: 'questions' });
QuizQuestion.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });

User.hasMany(QuizAttempt, { foreignKey: 'user_id', as: 'quizAttempts' });
QuizAttempt.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Quiz.hasMany(QuizAttempt, { foreignKey: 'quiz_id', as: 'attempts' });
QuizAttempt.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });

User.hasMany(LectureProgress, { foreignKey: 'user_id', as: 'lectureProgress' });
LectureProgress.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Resource.hasMany(LectureProgress, { foreignKey: 'resource_id', as: 'progressRows' });
LectureProgress.belongsTo(Resource, { foreignKey: 'resource_id', as: 'resource' });

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
  const classByName = new Map(classes.map((item) => [item.name, item]));
  const pgClass = classByName.get('PG (Postgraduate)') || classes[0];
  const ugClass = classByName.get('UG (Undergraduate)') || classes[0];

  const courseCount = await Course.count();
  if (courseCount === 0) {
    const courseSeed = [
      {
        name: 'Mock test only - MA Criminology CUET',
        class_ids: [pgClass.id],
        description: 'Focused mock test package with exam-like practice sets.',
        price: 1999,
        thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80'
      },
      {
        name: 'CUET M.Sc Psychology (Forensic/Neuro/Clinical)',
        class_ids: [pgClass.id],
        description: 'Comprehensive prep for M.Sc Psychology CUET pathways.',
        price: 6999,
        thumbnail: 'https://images.unsplash.com/photo-1573496799515-eebbb63814f2?auto=format&fit=crop&w=1200&q=80'
      },
      {
        name: 'CUET M.Sc Cyber Security / DFIS',
        class_ids: [pgClass.id],
        description: 'Cyber security and digital forensics intensive preparation track.',
        price: 7499,
        thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80'
      },
      {
        name: 'Mock test only - MSc Forensic Science',
        class_ids: [pgClass.id],
        description: 'Practice-first package with score analytics and instant feedback.',
        price: 2499,
        thumbnail: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=1200&q=80'
      },
      {
        name: 'CUET MA Criminology',
        class_ids: [pgClass.id],
        description: 'Concept + case-study based preparation for criminology entrance.',
        price: 6499,
        thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80'
      },
      {
        name: 'Mock test only - MSc Psychology',
        class_ids: [pgClass.id],
        description: 'Timed tests and solution walkthroughs for psychology aspirants.',
        price: 1999,
        thumbnail: 'https://images.unsplash.com/photo-1573496799515-eebbb63814f2?auto=format&fit=crop&w=1200&q=80'
      },
      {
        name: 'Mock test only - MSc Cyber / DFIS',
        class_ids: [pgClass.id],
        description: 'Cyber and DFIS mock exams aligned with latest CUET pattern.',
        price: 2299,
        thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80'
      },
      {
        name: 'CUET UG BSC (Forensic / Criminology)',
        class_ids: [ugClass.id],
        description: 'Strong foundation for UG aspirants with topic-wise guidance and practice.',
        price: 4999,
        thumbnail: 'https://images.unsplash.com/photo-1581093803931-46e730e7622e?auto=format&fit=crop&w=1200&q=80'
      },
      {
        name: 'CUET PG MSc Forensic Science (All specializations)',
        class_ids: [pgClass.id],
        description: 'Advanced preparation for CUET PG with expert mentorship and mock tests.',
        price: 6999,
        thumbnail: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=1200&q=80'
      },
      {
        name: 'Other',
        class_ids: classes.map((c) => c.id),
        description: 'Custom counseling-based preparation track.',
        price: 0,
        thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80'
      }
    ];

    for (const item of courseSeed) {
      const created = await Course.create({
        name: item.name,
        description: item.description,
        price: item.price,
        thumbnail: item.thumbnail
      });
      await CourseClass.bulkCreate(item.class_ids.map((cid) => ({ course_id: created.id, class_id: cid })));
    }
  }

  const firstCourse = await Course.findOne({ order: [['id', 'ASC']] });
  const defaultClassId = classes[0]?.id;

  const adminCount = await User.count({ where: { role: 'admin' } });
  if (adminCount === 0 && defaultClassId) {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    await User.create({
      first_name: 'Platform',
      last_name: 'Admin',
      email: 'admin@forensiq.com',
      phone: '9000000000',
      password: hashedPassword,
      class_id: defaultClassId,
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
        order_index: 1,
        content_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        title: 'Evidence Handling Notes',
        type: 'pdf',
        course_id: firstCourse.id,
        order_index: 2,
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
    const shouldRunMigrations = process.env.RUN_MIGRATIONS_ON_BOOT !== 'false';
    if (shouldRunMigrations) {
      console.log('Running database migrations...');
      try {
        // Use node to invoke sequelize-cli directly to avoid executable permission issues on some hosts.
        execSync('node ./node_modules/sequelize-cli/lib/sequelize db:migrate', { stdio: 'inherit' });
      } catch (migrationError) {
        const stderr = migrationError?.stderr?.toString?.() || migrationError.message;
        throw new Error(`Migration step failed: ${stderr}`);
      }
    }

    await sequelize.authenticate();

    const shouldSeed = process.env.SEED_ON_BOOT === 'true' || process.env.NODE_ENV !== 'production';
    if (shouldSeed) {
      await seedData();
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server bootstrap failed:', error.message);
    console.error('Run migrations first with: npm run migrate');
    process.exit(1);
  }
};

startServer();
