const express = require('express');
const router = express.Router();
const Thought = require('../models/Thought');

// GET all thoughts for a specific user
router.get('/:username', async (req, res) => {
  try {
    const thoughts = await Thought.find({ createdBy: req.params.username }).sort({ date: -1 });
    res.json(thoughts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new thought
router.post('/', async (req, res) => {
  try {
    const newThought = new Thought(req.body);
    await newThought.save();
    res.json({ success: true, thought: newThought });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a thought
router.delete('/:id', async (req, res) => {
  try {
    await Thought.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;