const express = require('express');
const { getQuizzes, createQuiz } = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getQuizzes);
router.post('/', authMiddleware, adminMiddleware, createQuiz);

module.exports = router;
