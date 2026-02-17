const mongoose = require('mongoose');
const projectSchema = new mongoose.Schema({
  title: String, 
  description: String, 
  status: { type: String, default: 'Pending' },
  createdBy: String, 
  createdAt: { type: Date, default: Date.now },
  tasks: [{ text: String, completed: { type: Boolean, default: false } }]
});
module.exports = mongoose.model('Project', projectSchema);