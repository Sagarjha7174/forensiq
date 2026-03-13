const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { submitQuizAttempt, getMyQuizHistory } = require('../controllers/quizAttemptController');

const router = express.Router();

router.post('/submit', authMiddleware, submitQuizAttempt);
router.get('/history', authMiddleware, getMyQuizHistory);

module.exports = router;
