const express = require('express');
const { getResources, createResource } = require('../controllers/resourceController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getResources);
router.post('/', authMiddleware, adminMiddleware, createResource);

module.exports = router;
