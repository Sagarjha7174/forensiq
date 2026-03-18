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

// Diagnostic endpoint to check SMTP config (no auth required for debugging)
router.get('/smtp-debug', (req, res) => {
	const smtpHost = process.env.SMTP_HOST ? '✓' : '✗';
	const smtpPort = process.env.SMTP_PORT ? '✓' : '✗';
	const smtpUser = process.env.SMTP_USER ? '✓' : '✗';
	const smtpPass = process.env.SMTP_PASS ? '✓' : '✗';
	const mailFrom = process.env.MAIL_FROM ? '✓' : '✗';
	
	res.json({
		smtp: {
			host: smtpHost,
			port: smtpPort,
			user: smtpUser,
			pass: smtpPass,
			from: mailFrom
		},
		config_complete: `${smtpHost}${smtpPort}${smtpUser}${smtpPass}${mailFrom}` === '✓✓✓✓✓' ? 'YES' : 'NO'
	});
});

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, profile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);
router.post('/test-mail', authMiddleware, sendTestMail);

module.exports = router;
