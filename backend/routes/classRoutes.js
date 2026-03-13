const express = require('express');
const { getClasses, createClass } = require('../controllers/classController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', getClasses);
router.post('/', authMiddleware, adminMiddleware, createClass);

module.exports = router;
