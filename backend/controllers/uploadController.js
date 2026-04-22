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
        } else if (fileExtension === '.txt') {
            extractedText = fs.readFileSync(filePath, 'utf8');
        } else {
            return res.status(400).json({ msg: 'Unsupported file type' });
        }

        // Clean up the uploaded file after processing
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        if (!extractedText || extractedText.trim().length < 10) {
            return res.status(400).json({ 
                msg: 'No readable text found in the file. Please ensure the file is not empty and the text is clear.' 
            });
        }

        res.json({ text: extractedText });
    } catch (err) {
        console.error("Upload/OCR Error:", err);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({ 
            msg: `Failed to extract text: ${err.message || 'Unknown OCR error'}`,
            error: err.toString()
        });
    }
};
