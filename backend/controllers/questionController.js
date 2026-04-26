const Question = require('../models/Question');
const { shuffleArray } = require('../utils/shuffle');

// @route   GET api/questions
// @desc    Get questions based on topic or company
exports.getQuestions = async (req, res) => {
    const { topic, company, difficulty, limit = 30 } = req.query;
    let query = {};

    if (topic) query.topic = topic;
    if (company) query.company_name = company;
    if (difficulty) query.difficulty = difficulty;

    try {
        // Step 1: Get specific matches
        let questions = await Question.aggregate([
            { $match: query },
            { $sample: { size: parseInt(limit) } }
        ]);

        // Step 2: Fallback if we have fewer questions than requested
        if (questions.length < parseInt(limit)) {
            const needed = parseInt(limit) - questions.length;
            const fallbackQuery = topic ? { topic, _id: { $nin: questions.map(q => q._id) } } : { _id: { $nin: questions.map(q => q._id) } };

            const extra = await Question.aggregate([
                { $match: fallbackQuery },
                { $sample: { size: needed } }
            ]);

            questions = [...questions, ...extra];
        }

        // Shuffle the final list to mix topic-specific and fallback questions
        // And also shuffle options within each question for maximum randomness
        const randomizedQuestions = shuffleArray(questions).map(q => {
            if (q.options && Array.isArray(q.options)) {
                return {
                    ...q,
                    options: shuffleArray(q.options)
                };
            }
            return q;
        });

        res.json(randomizedQuestions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   POST api/questions
// @desc    Add a new question (Internal/Admin)
exports.addQuestion = async (req, res) => {
    const { question_text, options, correct_answer, explanation, topic, difficulty, company_name, source } = req.body;

    try {
        const newQuestion = new Question({
            question_text,
            options,
            correct_answer,
            explanation,
            topic,
            difficulty,
            company_name,
            source
        });

        const question = await newQuestion.save();
        res.json(question);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET api/questions/topics
// @desc    Get list of unique topics
exports.getTopics = async (req, res) => {
    try {
        const topics = await Question.distinct('topic');
        res.json(topics);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET api/questions/companies
// @desc    Get list of unique companies
exports.getCompanies = async (req, res) => {
    try {
        const companies = await Question.distinct('company_name');
        res.json(companies.filter(c => c)); // Exclude null/empty
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
