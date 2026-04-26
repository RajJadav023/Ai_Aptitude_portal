const Test = require('../models/Test');
const Result = require('../models/Result');
const Question = require('../models/Question');
const User = require('../models/User');
const { shuffleArray } = require('../utils/shuffle');

// @route   POST api/tests/submit
// @desc    Submit test answers and calculate results
exports.submitTest = async (req, res) => {
    const { questions_list, answers } = req.body;
    const user_id = req.user.id;

    try {
        // Fetch all questions to compare answers
        const questions = await Question.find({ _id: { $in: questions_list } });

        let score = 0;
        let correct_answers = 0;
        let wrong_answers = 0;
        const topic_performance_map = {};

        questions.forEach((q, index) => {
            const q_id = q._id.toString();
            const q_idx = questions_list.indexOf(q_id);
            const user_answer = answers[q_idx];

            if (!topic_performance_map[q.topic]) {
                topic_performance_map[q.topic] = { correct: 0, total: 0 };
            }
            topic_performance_map[q.topic].total += 1;

            if (user_answer === q.correct_answer) {
                score += 1;
                correct_answers += 1;
                topic_performance_map[q.topic].correct += 1;
            } else {
                wrong_answers += 1;
            }
        });

        // Save Test
        const test = new Test({
            user_id,
            questions_list,
            answers,
            score
        });
        await test.save();

        // Convert performance map to array
        const topic_performance = Object.keys(topic_performance_map).map(topic => ({
            topic,
            correct: topic_performance_map[topic].correct,
            total: topic_performance_map[topic].total
        }));

        // Save Result
        const result = new Result({
            user_id,
            test_id: test._id,
            correct_answers,
            wrong_answers,
            score,
            topic_performance
        });
        await result.save();

        // Update User's tests_taken
        await User.findByIdAndUpdate(user_id, {
            $push: { tests_taken: test._id }
        });

        res.json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET api/tests/history
// @desc    Get user's test history
exports.getHistory = async (req, res) => {
    try {
        const results = await Result.find({ user_id: req.user.id })
            .populate('test_id')
            .sort({ date: -1 });
        res.json(results);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
// @route   GET api/tests/:id
// @desc    Get test by ID and populate questions
exports.getTestById = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id).populate('questions_list');
        
        if (!test) {
            return res.status(404).json({ msg: 'Test not found' });
        }

        // Check if test belongs to user
        if (test.user_id.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Randomize options for each question for a fresh experience
        const testObj = test.toObject();
        testObj.questions_list = testObj.questions_list.map(q => ({
            ...q,
            options: shuffleArray(q.options)
        }));

        res.json(testObj);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Test not found' });
        }
        res.status(500).send('Server error');
    }
};
