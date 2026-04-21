const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

// @route   POST api/upload
// @desc    Upload file and extract text
exports.uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    try {
        let extractedText = "";

        if (fileExtension === '.pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            extractedText = data.text;
        } else if (['.jpg', '.jpeg', '.png'].includes(fileExtension)) {
            const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
            extractedText = text;
        } else {
            return res.status(400).json({ msg: 'Unsupported file type' });
        }

        // Clean up the uploaded file after processing
        fs.unlinkSync(filePath);

        res.json({ text: extractedText });
    } catch (err) {
        console.error(err);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).send('Failed to extract text from file');
    }
};
