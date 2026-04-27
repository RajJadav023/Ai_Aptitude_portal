const mongoose = require('mongoose');

/**
 * Mongoose schema for Test Results.
 * Tracks user performance, scores, and topic-wise breakdown.
 */
const ResultSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    test_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    correct_answers: { type: Number, default: 0 },
    wrong_answers: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    topic_performance: [{
        topic: String,
        correct: Number,
        total: Number
    }],
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', ResultSchema);
