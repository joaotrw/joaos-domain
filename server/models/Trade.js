const mongoose = require('mongoose');
const tradeSchema = new mongoose.Schema({
  date: String, asset: String, action: String, amount: Number, price: Number,
  strategy: String, rMultiple: Number, purpleBelt: { type: Boolean, default: false },
  platform: String, orderType: String, stopLoss: Number, exitPrice: Number,
  entryTime: String, exitDate: String, exitTime: String, riskAmount: Number,
  expectedLoss: Number, realisedLoss: Number, realisedGains: Number,
  result: String, image: String, createdBy: String
});
module.exports = mongoose.model('Trade', tradeSchema);