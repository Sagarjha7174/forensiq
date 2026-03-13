const express = require('express');
const { getWorkshops, createWorkshop } = require('../controllers/workshopController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getWorkshops);
router.post('/', authMiddleware, createWorkshop);

module.exports = router;
