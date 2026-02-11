const express = require('express');
const { getMemberReports } = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/members', authMiddleware, getMemberReports);

module.exports = router;
