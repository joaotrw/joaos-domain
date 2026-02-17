const mongoose = require('mongoose');
const incomeSchema = new mongoose.Schema({
  date: String, 
  source: String, 
  amount: Number, 
  note: String, 
  createdBy: String
});
module.exports = mongoose.model('Income', incomeSchema);