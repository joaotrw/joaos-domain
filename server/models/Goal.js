const mongoose = require('mongoose');
const goalSchema = new mongoose.Schema({
  name: String, 
  targetAmount: Number, 
  currentAmount: { type: Number, default: 0 },
  deadline: String, 
  createdBy: String
});
module.exports = mongoose.model('Goal', goalSchema);