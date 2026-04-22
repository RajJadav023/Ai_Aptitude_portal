const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log('MongoDB Connection Error: ', err));

// Import Routes
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const testRoutes = require('./routes/tests');
const aiRoutes = require('./routes/ai');
const uploadRoutes = require('./routes/upload');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    const fs = require('fs');
    const logMessage = `[${new Date().toISOString()}] ${err.stack || err}\n`;
    fs.appendFileSync(path.join(__dirname, 'debug.log'), logMessage);
    
    console.error("Global Error:", err);
    res.status(err.status || 500).json({
        msg: err.message || 'An unexpected server error occurred',
        error: err.toString()
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
