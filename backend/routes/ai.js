const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/auth');

// @route   POST api/ai/generate-mock
router.post('/generate-mock', authMiddleware, aiController.generateMock);

// @route   POST api/ai/process-upload
router.post('/process-upload', authMiddleware, aiController.processUpload);

module.exports = router;
