const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const authMiddleware = require('../middleware/auth');

// @route   POST api/tests/submit
router.post('/submit', authMiddleware, testController.submitTest);

// @route   GET api/tests/history
router.get('/history', authMiddleware, testController.getHistory);

// @route   GET api/tests/:id
router.get('/:id', authMiddleware, testController.getTestById);

module.exports = router;
