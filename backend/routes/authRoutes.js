const express = require('express');
const {
	register,
	login,
	profile,
	updateProfile,
	changePassword,
	sendTestMail
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, profile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);
router.post('/test-mail', authMiddleware, sendTestMail);

module.exports = router;
