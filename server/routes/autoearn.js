const express = require('express');
const router = express.Router();
const AutoEarn = require('../models/AutoEarn');

router.get('/', async (req, res) => {
  try {
    const currentUser = req.headers['current-user']; // Fix: Extract from headers
    const query = req.headers['user-role'] === 'Admin' ? {} : { username: currentUser };
    const data = await AutoEarn.find(query).sort({ date: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const newEarn = new AutoEarn(req.body);
  await newEarn.save();
  res.json({ success: true });
});

router.patch('/:id', async (req, res) => {
  const updated = await AutoEarn.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  await AutoEarn.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;