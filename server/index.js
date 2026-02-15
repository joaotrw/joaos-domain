require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();

// ==========================================
// 1. MIDDLEWARE
// ==========================================
app.use(cors());

/** * IMPORTANT: We increased the limit to 50mb. 
 * Base64 image strings are much larger than standard text.
 */
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ==========================================
// 2. DATABASE CONNECTION
// ==========================================
const dbURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/joaos_domain';

mongoose.connect(dbURI)
  .then(() => console.log("Cloud Database Connected Successfully"))
  .catch(err => console.error("Database connection error:", err));

// ==========================================
// 3. MODELS
// ==========================================

const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'User' }
}));

// All fields requested for the Trade Logger
// index.js - Updated Trade Model
const Trade = mongoose.model('Trade', new mongoose.Schema({
  date: String, 
  asset: String, 
  action: String, 
  amount: Number, 
  price: Number,
  strategy: String, 
  rMultiple: Number, 
  purpleBelt: { type: Boolean, default: false }, 
  platform: String,
  orderType: String, 
  stopLoss: Number, 
  exitPrice: Number, 
  entryTime: String,
  exitDate: String, 
  exitTime: String, 
  riskAmount: Number, 
  expectedLoss: Number,
  realisedLoss: Number, 
  realisedGains: Number,
  result: String,   
  image: String,    
  createdBy: String
}));

const Project = mongoose.model('Project', new mongoose.Schema({
  title: String, 
  description: String, 
  status: { type: String, default: 'Pending' },
  createdBy: String, 
  createdAt: { type: Date, default: Date.now },
  tasks: [{ text: String, completed: { type: Boolean, default: false } }]
}));

const Finance = mongoose.model('Finance', new mongoose.Schema({
  date: { type: String, required: true },
  bank: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: String,
  createdBy: String,
  createdAt: { type: Date, default: Date.now }
}));

const Income = mongoose.model('Income', new mongoose.Schema({
  date: String, 
  source: String, 
  amount: Number, 
  note: String, 
  createdBy: String
}));

const Goal = mongoose.model('Goal', new mongoose.Schema({
  name: String, 
  targetAmount: Number, 
  currentAmount: { type: Number, default: 0 },
  deadline: String, 
  createdBy: String
}));

const Task = mongoose.model('Task', new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}));

const Backtest = mongoose.model('Backtest', new mongoose.Schema({
  username: String, 
  asset: String,
  date: Date,
  direction: String,
  entry: Number,
  stopLoss: Number,
  exit: Number,
  returns: Number,
  result: String,
  image: String, 
  createdAt: { type: Date, default: Date.now }
}));

// ==========================================
// 4. ROUTES
// ==========================================

// --- Auth Routes ---
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      return res.json({ success: true, message: `Welcome, ${user.username}`, role: user.role });
    }
    res.status(401).json({ success: false, message: "Invalid credentials." });
  } catch (error) { res.status(500).json({ message: "Server error" }); }
});

app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: "User exists!" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.json({ success: true, message: "Account secured and created!" });
  } catch (err) { res.status(500).json({ message: "Registration error" }); }
});

// --- User Management ---
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.delete('/api/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// --- Finance Routes ---
app.get('/api/finance', async (req, res) => {
  const currentUser = req.headers['current-user'];
  let query = req.headers['user-role'] === 'Admin' ? {} : { 
    $or: [{ createdBy: currentUser }, { createdBy: { $exists: false } }]
  };
  const finance = await Finance.find(query).sort({ date: -1 });
  res.json(finance);
});

app.post('/api/finance', async (req, res) => {
  try {
    const newEntry = new Finance(req.body);
    await newEntry.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.delete('/api/finance/:id', async (req, res) => {
  await Finance.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// --- Income Routes ---
app.get('/api/income', async (req, res) => {
  const currentUser = req.headers['current-user'];
  const query = req.headers['user-role'] === 'Admin' ? {} : { 
    $or: [{ createdBy: currentUser }, { createdBy: { $exists: false } }]
  };
  const income = await Income.find(query).sort({ date: -1 });
  res.json(income);
});

app.post('/api/income', async (req, res) => {
  try {
    const newIncome = new Income(req.body);
    await newIncome.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// --- Project Routes ---
app.get('/api/projects', async (req, res) => {
  const query = req.headers['user-role'] === 'Admin' ? {} : { createdBy: req.headers['current-user'] };
  const projects = await Project.find(query).sort({ createdAt: -1 });
  res.json(projects);
});

app.post('/api/projects', async (req, res) => {
  const newProject = new Project(req.body);
  await newProject.save();
  res.json({ success: true });
});

app.put('/api/projects/:id/status', async (req, res) => {
  const project = await Project.findById(req.params.id);
  const statusMap = { 'Pending': 'In Progress', 'In Progress': 'Completed', 'Completed': 'Pending' };
  project.status = statusMap[project.status] || 'Pending';
  await project.save();
  res.json({ success: true, newStatus: project.status });
});

app.post('/api/projects/:id/tasks', async (req, res) => {
  const project = await Project.findById(req.params.id);
  project.tasks.push({ text: req.body.text });
  await project.save();
  res.json(project);
});

// --- Trade Routes (Logger) ---
app.get('/api/trades', async (req, res) => {
  try {
    const user = req.headers['current-user'];
    const query = req.headers['user-role'] === 'Admin' ? {} : { createdBy: user };
    const trades = await Trade.find(query).sort({ date: -1 });
    res.json(trades);
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/trades', async (req, res) => {
  try {
    const newTrade = new Trade(req.body);
    await newTrade.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.patch('/api/trades/:id', async (req, res) => {
  try {
    const updated = await Trade.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true }
    );
    res.json({ success: true, trade: updated });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.delete('/api/trades/:id', async (req, res) => {
  try {
    await Trade.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// --- Goal Routes ---
app.get('/api/goals', async (req, res) => {
  const query = req.headers['user-role'] === 'Admin' ? {} : { createdBy: req.headers['current-user'] };
  const goals = await Goal.find(query);
  res.json(goals);
});

app.post('/api/goals', async (req, res) => {
  const newGoal = new Goal(req.body);
  await newGoal.save();
  res.json({ success: true });
});

app.patch('/api/goals/:id', async (req, res) => {
  const updatedGoal = await Goal.findByIdAndUpdate(
    req.params.id, 
    { $inc: { currentAmount: req.body.amount } }, 
    { new: true }
  );
  res.json(updatedGoal);
});

// --- Backtest Routes ---
app.get('/api/backtests/:username', async (req, res) => {
  try {
    const data = await Backtest.find({ username: req.params.username }).sort({ date: -1 });
    res.json(data);
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/backtests', async (req, res) => {
  try {
    const newBt = new Backtest(req.body);
    await newBt.save();
    res.json({ success: true, message: "Backtest saved to cloud!" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.delete('/api/backtests/:id', async (req, res) => {
  try {
    await Backtest.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// --- Task Routes ---
app.get('/api/tasks', async (req, res) => {
  const query = req.headers['user-role'] === 'Admin' ? {} : { createdBy: req.headers['current-user'] };
  const tasks = await Task.find(query).sort({ createdAt: -1 });
  res.json(tasks);
});

app.post('/api/tasks', async (req, res) => {
  const newTask = new Task(req.body);
  await newTask.save();
  res.json({ success: true });
});

app.patch('/api/tasks/:id', async (req, res) => {
  const task = await Task.findById(req.params.id);
  task.completed = !task.completed;
  await task.save();
  res.json({ success: true, completed: task.completed });
});

app.delete('/api/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// --- Server & Health Check ---
app.get('/api/welcome', (req, res) => {
  res.json({ message: "Connected to Joao's Domain Backend." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});