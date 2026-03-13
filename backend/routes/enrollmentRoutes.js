const express = require('express');
const {
  createOrder,
  verifyPayment,
  enrollFree,
  getMyCourses
} = require('../controllers/enrollmentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-order', authMiddleware, createOrder);
router.post('/verify', authMiddleware, verifyPayment);
router.post('/free', authMiddleware, enrollFree);
router.get('/my-courses', authMiddleware, getMyCourses);

module.exports = router;
