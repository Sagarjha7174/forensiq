const express = require('express');
const { markLectureCompleted, getLectureProgress } = require('../controllers/progressController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/complete', authMiddleware, markLectureCompleted);
router.get('/', authMiddleware, getLectureProgress);

module.exports = router;
