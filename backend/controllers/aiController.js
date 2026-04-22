const aiService = require('../services/aiService');
const Question = require('../models/Question');
const Test = require('../models/Test');

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
        res.json(extractedQuestions);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to process uploaded text');
    }
};

// @route   POST api/ai/create-company-mock
// @desc    Upload paper -> AI Extract & Generate -> Mix with DB -> Create Test
exports.createCompanyMock = async (req, res) => {
    const { text, companyName, totalCount = 20 } = req.body;
    const userId = req.user.id;

    try {
        // 1. Combined AI task: Extract and Generate in ONE request to save quota
        const aiData = await aiService.extractAndGenerateMock(text, companyName, 10);
        
        const rawQuestions = [...(aiData.extracted || []), ...(aiData.generated || [])];

        // 2. Validate and Sanitize Questions (Must have question_text, options, correct_answer, topic)
        const validQuestions = rawQuestions.filter(q => 
            q && 
            q.question_text && 
            Array.isArray(q.options) && q.options.length >= 2 &&
            q.correct_answer && 
            q.topic
        ).map(q => ({
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation || '',
            topic: q.topic,
            difficulty: q.difficulty || 'Medium',
            company_name: companyName,
            source: 'Uploaded-AI'
        }));

        if (validQuestions.length === 0) {
            return res.status(400).json({ 
                msg: 'AI could not find or generate valid questions from this file. Please ensure the content is clear.' 
            });
        }

        // 3. Save to DB (Publicly)
        const savedNewQuestions = await Question.insertMany(validQuestions);
        const newQuestionIds = savedNewQuestions.map(q => q._id);

        // 4. Mixing Logic (~80% from paper pattern, ~20% variety from DB)
        const targetFromNew = Math.min(newQuestionIds.length, Math.floor(totalCount * 0.8));
        const targetFromDB = totalCount - targetFromNew;

        // Fetch variety questions from DB (preferably not the ones we just added)
        const dbQuestions = await Question.aggregate([
            { $match: { _id: { $nin: newQuestionIds } } },
            { $sample: { size: targetFromDB } }
        ]);

        const dbQuestionIds = dbQuestions.map(q => q._id);

        // Combine
        const finalQuestionIds = [
            ...newQuestionIds.slice(0, targetFromNew),
            ...dbQuestionIds
        ];

        // 5. Create the Test
        const newTest = new Test({
            user_id: userId,
            questions_list: finalQuestionIds,
            answers: new Array(finalQuestionIds.length).fill(null),
            score: 0
        });

        await newTest.save();

        res.json({ testId: newTest._id, count: finalQuestionIds.length });
    } catch (err) {
        console.error("Company Mock Creation Error:", err);
        res.status(500).json({ 
            msg: 'Backend processing failed. This might be due to an invalid AI response or database error.',
            error: err.message 
        });
    }
};
