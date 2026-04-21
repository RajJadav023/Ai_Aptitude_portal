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
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log('MongoDB Connection Error: ', err));

// Routes
app.get('/', (req, res) => {
    res.send('Aptitude Portal API is running...');
});

// Import Routes
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const testRoutes = require('./routes/tests');
const aiRoutes = require('./routes/ai');
const uploadRoutes = require('./routes/upload');

app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
