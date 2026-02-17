const express = require('express');
const router = express.Router();
const Backtest = require('../models/Backtest');

// GET backtests by username
router.get('/:username', async (req, res) => {
  try {
    const data = await Backtest.find({ username: req.params.username }).sort({ date: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST new backtest
router.post('/', async (req, res) => {
  try {
    const newBt = new Backtest(req.body);
    await newBt.save();
    res.json({ success: true, message: "Backtest saved to cloud!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE backtest
router.delete('/:id', async (req, res) => {
  try {
    await Backtest.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;