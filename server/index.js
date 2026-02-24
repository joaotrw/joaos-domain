require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// 1. MIDDLEWARE
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 2. DATABASE CONNECTION
const dbURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/joaos_domain';

mongoose.connect(dbURI)
  .then(() => console.log("🚀 Cloud Database Connected Successfully"))
  .catch(err => console.error("❌ Database connection error:", err));

// 3. ROUTES SETUP
const authRoutes = require('./routes/auth');
const financeRoutes = require('./routes/finance');
const incomeRoutes = require('./routes/income');
const tradeRoutes = require('./routes/trades');
const taskRoutes = require('./routes/tasks');
const projectRoutes = require('./routes/projects');
const goalRoutes = require('./routes/goals');
const autoEarnRoutes = require('./routes/autoearn');
const backtestRoutes = require('./routes/backtest'); // FIXED: Removed 's' to match your file backtest.js
const thoughtRoutes = require('./routes/thoughts');

app.use('/api', authRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/autoearn', autoEarnRoutes);
app.use('/api/backtests', backtestRoutes);
app.use('/api/thoughts', thoughtRoutes);

// Health Check
app.get('/api/welcome', (req, res) => {
  res.json({ message: "Connected to Joao's Domain Backend." });
});

// 4. SERVER START
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});