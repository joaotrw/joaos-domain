const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

router.get('/', async (req, res) => {
  try {
    const currentUser = req.headers['current-user'];
    const userRole = req.headers['user-role'];
    
    const query = userRole === 'Admin' ? {} : { createdBy: currentUser };
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const newTask = new Task(req.body);
  await newTask.save();
  res.json({ success: true });
});

router.patch('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found in DB" });
    
    task.completed = !task.completed;
    await task.save();
    res.json({ success: true, completed: task.completed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;