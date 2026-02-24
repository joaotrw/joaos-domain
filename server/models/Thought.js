const mongoose = require('mongoose');

const thoughtSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  title: String,
  content: String,
  sentiment: { type: String, enum: ['Bullish', 'Bearish', 'Neutral'] },
  createdBy: String
});

module.exports = mongoose.model('Thought', thoughtSchema);