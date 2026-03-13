const { Op } = require('sequelize');
const Quiz = require('../models/Quiz');
const QuizQuestion = require('../models/QuizQuestion');
const Notification = require('../models/Notification');

exports.getQuizzes = async (req, res) => {
  try {
    const where = {};

    if (req.user.role !== 'admin') {
      where[Op.or] = [
        { class_id: req.user.class_id },
        { course_id: req.user.course_id },
        { class_id: null, course_id: null }
      ];
    }

    if (req.query.course_id) {
      where.course_id = req.query.course_id;
    }

    const quizzes = await Quiz.findAll({
      where,
      include: [{ model: QuizQuestion, as: 'questions' }],
      order: [['id', 'DESC']]
    });

    return res.json(quizzes);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch quizzes', error: error.message });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const { title, class_id, course_id, timer_minutes, questions = [] } = req.body;
    const quiz = await Quiz.create({ title, class_id, course_id, timer_minutes });

    if (questions.length) {
      await QuizQuestion.bulkCreate(
        questions.map((q) => ({
          quiz_id: quiz.id,
          question: q.question,
          options_json: q.options,
          correct_option: q.correct_option
        }))
      );
    }

    await Notification.create({
      title: 'New Quiz Available',
      message: `${title} is now available for practice.`,
      class_id,
      course_id
    });

    const result = await Quiz.findByPk(quiz.id, {
      include: [{ model: QuizQuestion, as: 'questions' }]
    });

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create quiz', error: error.message });
  }
};
