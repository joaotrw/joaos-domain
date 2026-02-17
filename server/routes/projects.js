const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

router.get('/', async (req, res) => {
  try {
    const currentUser = req.headers['current-user']; // Fix: Extract from headers
    const query = req.headers['user-role'] === 'Admin' ? {} : { createdBy: currentUser };
    const projects = await Project.find(query).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new project
router.post('/', async (req, res) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update project status (Cycle: Pending -> In Progress -> Completed)
router.put('/:id/status', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    const statusMap = { 'Pending': 'In Progress', 'In Progress': 'Completed', 'Completed': 'Pending' };
    project.status = statusMap[project.status] || 'Pending';
    await project.save();
    res.json({ success: true, newStatus: project.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add task to project
router.post('/:id/tasks', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    project.tasks.push({ text: req.body.text });
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;