const express = require('express'); // <--- ADD THIS LINE
const router = express.Router();
const Income = require('../models/Income');

router.get('/', async (req, res) => {
  try {
    const currentUser = req.headers['current-user']; // Must define this first
    const query = req.headers['user-role'] === 'Admin' ? {} : { createdBy: currentUser };
    const income = await Income.find(query).sort({ date: -1 });
    res.json(income);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new income
router.post('/', async (req, res) => {
  try {
    const newIncome = new Income(req.body);
    await newIncome.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE income
router.delete('/:id', async (req, res) => {
  try {
    await Income.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;