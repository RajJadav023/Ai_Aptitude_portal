const aiService = require('../services/aiService');
const Question = require('../models/Question');

// @route   POST api/ai/generate-mock
exports.generateMock = async (req, res) => {
    const { topic, difficulty, count } = req.body;

    try {
        const questionsData = await aiService.generateMockTest(topic, difficulty, count);

        // Save to DB and return
        const savedQuestions = await Question.insertMany(questionsData.map(q => ({
            ...q,
            source: 'AI-Generated'
        })));

        res.json(savedQuestions);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to generate mock test');
    }
};

// @route   POST api/ai/process-upload
// @desc    Process OCR text and extract questions using AI
exports.processUpload = async (req, res) => {
    const { text } = req.body;

    try {
        const extractedQuestions = await aiService.extractQuestionsFromText(text);

        // Return for user review before saving or save directly
        // For now, let's return them so the user can verify
        res.json(extractedQuestions);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to process uploaded text');
    }
};
