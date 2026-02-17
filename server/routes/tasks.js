const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

router.get('/', async (req, res) => {
const query = req.headers['user-role'] === 'Admin' ? {} : { createdBy: currentUser };  const task = await Task.find(query).sort({ date: -1 });
  const tasks = await Task.find(query).sort({ createdAt: -1 });
  res.json(tasks);
});

router.post('/', async (req, res) => {
  const newTask = new Task(req.body);
  await newTask.save();
  res.json({ success: true });
});

router.patch('/:id', async (req, res) => {
  const task = await Task.findById(req.params.id);
  task.completed = !task.completed;
  await task.save();
  res.json({ success: true, completed: task.completed });
});

router.delete('/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;