const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateMockTest = async (topic, difficulty, count = 10) => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

exports.extractAndGenerateMock = async (rawText, companyName, generateCount = 10) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are an expert aptitude paper generator. I will provide raw text from a ${companyName} placement paper.
    
    Tasks:
    1. EXTRACT: Find and format all existing MCQ questions from the text below.
    2. GENERATE: Create ${generateCount} NEW, UNIQUE questions that follow the exact same pattern, topics, and difficulty found in the text.
    
    Return the response strictly as a JSON object with this structure:
    {
      "extracted": [
        { "question_text": "...", "options": ["A", "B", "C", "D"], "correct_answer": "...", "topic": "...", "explanation": "...", "difficulty": "Medium" }
      ],
      "generated": [
        { "question_text": "...", "options": ["A", "B", "C", "D"], "correct_answer": "...", "topic": "...", "explanation": "...", "difficulty": "Medium" }
      ]
    }
    
    Raw Text:
    ${rawText}`;

    const retry = async (fn, n = 3, delay = 2000) => {
        for (let i = 0; i < n; i++) {
            try {
                return await fn();
            } catch (err) {
                if (i === n - 1) throw err;
                if (err.status === 429) {
                    console.log(`Rate limit hit, retrying in ${delay / 1000}s... (Attempt ${i + 1})`);
                    await new Promise(res => setTimeout(res, delay));
                    delay *= 2; // Exponential backoff
                } else {
                    throw err;
                }
            }
        }
    };

    try {
        const result = await retry(() => model.generateContent(prompt));
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (err) {
        console.error("Combined AI Error:", err);
        return { extracted: [], generated: [] };
    }
};
