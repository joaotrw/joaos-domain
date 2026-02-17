const express = require('express');
const router = express.Router();
const Finance = require('../models/Finance');

router.get('/', async (req, res) => {
  const currentUser = req.headers['current-user'];
const query = req.headers['user-role'] === 'Admin' ? {} : { createdBy: currentUser };  const finance = await Finance.find(query).sort({ date: -1 });
  res.json(finance);
});

router.post('/', async (req, res) => {
  const newEntry = new Finance(req.body);
  await newEntry.save();
  res.json({ success: true });
});

router.delete('/:id', async (req, res) => {
  await Finance.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;