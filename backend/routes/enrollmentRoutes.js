const express = require('express');
const { enrollInCourse, getMyCourses } = require('../controllers/enrollmentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, enrollInCourse);
router.get('/my-courses', authMiddleware, getMyCourses);

module.exports = router;
