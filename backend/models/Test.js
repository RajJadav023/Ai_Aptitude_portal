const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questions_list: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true }],
    answers: [{ type: String }], // User selected options
    score: { type: Number, default: 0 },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Test', TestSchema);
