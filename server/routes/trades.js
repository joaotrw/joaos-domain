const express = require('express');
const router = express.Router();
const Trade = require('../models/Trade');

router.get('/', async (req, res) => {
  try {
    const currentUser = req.headers['current-user']; // Fix: Was named 'user' before, inconsistent with other files
    const query = req.headers['user-role'] === 'Admin' ? {} : { createdBy: currentUser };
    const trades = await Trade.find(query).sort({ date: -1 });
    res.json(trades);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const newTrade = new Trade(req.body);
  await newTrade.save();
  res.json({ success: true });
});

router.patch('/:id', async (req, res) => {
  const updated = await Trade.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  res.json({ success: true, trade: updated });
});

router.delete('/:id', async (req, res) => {
  await Trade.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;