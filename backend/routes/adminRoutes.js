const express = require('express');
const { getDashboardStats, getUsers, deleteUser } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);
router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.delete('/user/:id', deleteUser);

module.exports = router;
