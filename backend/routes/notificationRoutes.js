const express = require('express');
const {
	getNotifications,
	createNotification,
	updateNotification,
	deleteNotification
} = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getNotifications);
router.post('/', authMiddleware, adminMiddleware, createNotification);
router.put('/:id', authMiddleware, adminMiddleware, updateNotification);
router.delete('/:id', authMiddleware, adminMiddleware, deleteNotification);

module.exports = router;
