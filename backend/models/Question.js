const mongoose = require('mongoose');

/**
 * Mongoose schema for Aptitude Questions.
 * Supports categorization by topic, difficulty, and optional company tags.
 */
const QuestionSchema = new mongoose.Schema({
    question_text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correct_answer: { type: String, required: true },
    explanation: { type: String },
    topic: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    company_name: { type: String }, // Optional for company-specific questions
    source: { type: String }, // e.g., 'Uploaded', 'AI-Generated', 'System'
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', QuestionSchema);
