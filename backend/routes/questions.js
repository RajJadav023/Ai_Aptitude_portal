const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const authMiddleware = require('../middleware/auth');

// @route   GET api/questions
router.get('/', authMiddleware, questionController.getQuestions);

// @route   POST api/questions
router.post('/', authMiddleware, questionController.addQuestion);

// @route   GET api/questions/topics
router.get('/topics', authMiddleware, questionController.getTopics);

// @route   GET api/questions/companies
router.get('/companies', authMiddleware, questionController.getCompanies);

module.exports = router;
