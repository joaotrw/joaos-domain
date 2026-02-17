const mongoose = require('mongoose');
const autoEarnSchema = new mongoose.Schema({
  username: { type: String, required: true },
  platform: { type: String, required: true },
  asset: { type: String, required: true },
  amount: { type: Number, required: true },
  apy: { type: Number, default: 0 },
  status: { type: String, default: 'Active' },
  date: { type: Date, default: Date.now }
});
module.exports = mongoose.model('AutoEarn', autoEarnSchema);