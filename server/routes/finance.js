const express = require('express');
const router = express.Router();
const Finance = require('../models/Finance');

// GET all transactions
router.get('/', async (req, res) => {
  try {
    const currentUser = req.headers['current-user'];
    const userRole = req.headers['user-role'];
    
    // Ensure January entries aren't hidden by checking ownership
    const query = userRole === 'Admin' ? {} : { createdBy: currentUser };
    
    const finance = await Finance.find(query).sort({ date: -1 });
    res.json(finance);
  } catch (err) {
    res.status(500).json({ message: "Error fetching transactions", error: err.message });
  }
});

// POST new entry
router.post('/', async (req, res) => {
  try {
    // Ensure the entry is tagged with the user who created it
    const entryData = {
      ...req.body,
      createdBy: req.headers['current-user'] // Guardrail for data integrity
    };
    
    const newEntry = new Finance(entryData);
    await newEntry.save();
    res.json({ success: true, data: newEntry });
  } catch (err) {
    res.status(400).json({ message: "Error saving entry", error: err.message });
  }
});

// DELETE entry
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Finance.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error deleting entry", error: err.message });
  }
});

module.exports = router;