const Quiz = require('../models/Quiz');
const QuizQuestion = require('../models/QuizQuestion');
const QuizAttempt = require('../models/QuizAttempt');
const Enrollment = require('../models/Enrollment');

exports.submitQuizAttempt = async (req, res) => {
  try {
    const { quiz_id, answers = [] } = req.body;
    if (!quiz_id) return res.status(400).json({ message: 'quiz_id is required' });

    const quiz = await Quiz.findByPk(quiz_id, { include: [{ model: QuizQuestion, as: 'questions' }] });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    if (req.user.role !== 'admin') {
      const enrolled = await Enrollment.findOne({ where: { user_id: req.user.id, course_id: quiz.course_id } });
      if (!enrolled) return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    const answerMap = new Map(answers.map((a) => [Number(a.question_id), a.selected_option]));
    let score = 0;

    for (const q of quiz.questions) {
      const selected = answerMap.get(q.id);
      if (selected && selected === q.correct_option) score += 1;
    }

    const attempt = await QuizAttempt.create({
      user_id: req.user.id,
      quiz_id,
      score,
      total_questions: quiz.questions.length,
      answers_json: answers
    });

    return res.status(201).json({
      message: 'Quiz submitted',
      attempt,
      result: {
        score,
        total_questions: quiz.questions.length,
        percentage: quiz.questions.length ? Math.round((score / quiz.questions.length) * 100) : 0
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit quiz', error: error.message });
  }
};

exports.getMyQuizHistory = async (req, res) => {
  try {
    const where = { user_id: req.user.id };
    if (req.query.course_id) {
      const quizzes = await Quiz.findAll({ where: { course_id: req.query.course_id }, attributes: ['id'] });
      where.quiz_id = quizzes.map((q) => q.id);
      if (!where.quiz_id.length) return res.json([]);
    }

    const attempts = await QuizAttempt.findAll({
      where,
      include: [{ model: Quiz, as: 'quiz', attributes: ['id', 'title', 'course_id'] }],
      order: [['id', 'DESC']]
    });

    return res.json(attempts);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch quiz history', error: error.message });
  }
};
