const express = require('express');
const {
	getCourses,
	getCourseById,
	createCourse,
	updateCourse,
	deleteCourse
} = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', getCourses);
router.post('/', authMiddleware, adminMiddleware, createCourse);
router.get('/:id', getCourseById);
router.put('/:id', authMiddleware, adminMiddleware, updateCourse);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCourse);

module.exports = router;
