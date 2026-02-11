const express = require('express');
const { createMess, joinMess, getMyMess } = require('../controllers/messController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', authMiddleware, createMess);
router.post('/join', authMiddleware, joinMess);
router.get('/me', authMiddleware, getMyMess);

module.exports = router;
