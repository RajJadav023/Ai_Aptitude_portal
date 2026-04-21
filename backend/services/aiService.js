const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateMockTest = async (topic, difficulty, count = 10) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate ${count} aptitude multiple choice questions for the topic "${topic}" with difficulty "${difficulty}".
    Return the response strictly as a JSON array of objects.
    Each object must have:
    - question_text: The question string.
    - options: An array of 4 strings.
    - correct_answer: The string matching one of the options.
    - explanation: A short explanation.
    - topic: "${topic}".
    - difficulty: "${difficulty}".
    Ensure the questions are high quality and similar to placement papers.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up JSON if necessary (sometimes Gemini adds markdown code blocks)
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(text);
    } catch (err) {
        console.error("AI Generation Error:", err);
        throw err;
    }
};

exports.extractQuestionsFromText = async (rawText) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Convert the following raw text from an aptitude paper into a JSON array of MCQ objects.
    Extract as many complete questions as possible.
    The format should be:
    - question_text
    - options (4 strings)
    - correct_answer (if identifiable, else null)
    - topic (classify one: Time & Work, Number System, Logical Reasoning, etc.)
    - explanation (optional)
    
    Raw Text:
    ${rawText}`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (err) {
        console.error("AI Extraction Error:", err);
        throw err;
    }
};
