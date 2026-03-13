const express = require('express');
const { getQuizzes, createQuiz, deleteQuiz } = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getQuizzes);
router.post('/', authMiddleware, adminMiddleware, createQuiz);
router.delete('/:id', authMiddleware, adminMiddleware, deleteQuiz);

module.exports = router;
