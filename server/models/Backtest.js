const mongoose = require('mongoose');
const backtestSchema = new mongoose.Schema({
  username: String, 
  asset: String,
  date: Date,
  direction: String,
  entry: Number,
  stopLoss: Number,
  exit: Number,
  returns: Number,
  result: String,
  image: String, 
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Backtest', backtestSchema);