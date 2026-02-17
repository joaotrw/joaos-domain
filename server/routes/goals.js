const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');

router.get('/', async (req, res) => {
  try {
    const currentUser = req.headers['current-user']; // Define it here
    const query = req.headers['user-role'] === 'Admin' ? {} : { createdBy: currentUser };
    const goals = await Goal.find(query); // Removed the duplicate 'goal' line
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new goal
router.post('/', async (req, res) => {
  try {
    const newGoal = new Goal(req.body);
    await newGoal.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH update goal progress
router.patch('/:id', async (req, res) => {
  try {
    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.id, 
      { $inc: { currentAmount: req.body.amount } }, 
      { new: true }
    );
    res.json(updatedGoal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;