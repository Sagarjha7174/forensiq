const { Op } = require('sequelize');
const Quiz = require('../models/Quiz');
const QuizQuestion = require('../models/QuizQuestion');
const Notification = require('../models/Notification');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

exports.getQuizzes = async (req, res) => {
  try {
    const where = {};

    if (req.query.course_id) {
      where.course_id = req.query.course_id;
    } else if (req.user.role !== 'admin') {
      const enrollments = await Enrollment.findAll({ where: { user_id: req.user.id } });
      const enrolledCourseIds = enrollments.map((e) => e.course_id);
      if (enrolledCourseIds.length === 0) return res.json([]);
      where.course_id = { [Op.in]: enrolledCourseIds };
    }

    const quizzes = await Quiz.findAll({
      where,
      include: [
        { model: QuizQuestion, as: 'questions' },
        { model: Course, as: 'course', attributes: ['id', 'name'] }
      ],
      order: [['id', 'DESC']]
    });

    return res.json(quizzes);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch quizzes', error: error.message });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const { title, course_id, timer_minutes = 30, questions = [] } = req.body;
    if (!title || !course_id) {
      return res.status(400).json({ message: 'title and course_id are required' });
    }

    const quiz = await Quiz.create({ title, course_id, timer_minutes });

    if (questions.length) {
      await QuizQuestion.bulkCreate(
        questions.map((q) => ({
          quiz_id: quiz.id,
          question: q.question,
          options_json: Array.isArray(q.options) ? q.options : q.options_json,
          correct_option: q.correct_option
        }))
      );
    }

    const course = await Course.findByPk(course_id);
    await Notification.create({
      title: 'New Quiz Available',
      message: `${title} quiz is now available in ${course?.name || 'your course'}.`,
      course_id
    });

    const result = await Quiz.findByPk(quiz.id, {
      include: [{ model: QuizQuestion, as: 'questions' }, { model: Course, as: 'course', attributes: ['id', 'name'] }]
    });

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create quiz', error: error.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    await QuizQuestion.destroy({ where: { quiz_id: quiz.id } });
    await quiz.destroy();
    return res.json({ message: 'Quiz deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete quiz', error: error.message });
  }
};
