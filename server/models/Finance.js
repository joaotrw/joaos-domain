const mongoose = require('mongoose');
const financeSchema = new mongoose.Schema({
  date: { type: String, required: true },
  bank: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: String, createdBy: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Finance', financeSchema);