require('dotenv').config(); // 1. Load the environment variables
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;
// We add '0.0.0.0' so AWS can reach the container
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
app.use(cors());
app.use(express.json());

// 2. DATABASE CONNECTION (Now using the Cloud URI)
const dbURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/joaos_domain';

mongoose.connect(dbURI)
  .then(() => console.log("Cloud Database Connected Successfully"))
  .catch(err => console.error("Database connection error:", err));


// User Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // New field
  role: { type: String, default: 'User' }
});

const User = mongoose.model('User', userSchema);

// Trade Model
const Trade = mongoose.model('Trade', new mongoose.Schema({
  date: String,
  asset: String,
  action: String,
  amount: Number,
  price: Number,
  strategy: String,
  rMultiple: Number,
  purpleBelt: Boolean,
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
  createdBy: String
}));

// Trade Routes
app.get('/api/trades', async (req, res) => {
  const trades = await Trade.find().sort({ date: -1 });
  res.json(trades);
});

app.post('/api/trades', async (req, res) => {
  const newTrade = new Trade(req.body);
  await newTrade.save();
  res.json({ success: true });
});

// 3. ROUTES (Must be BEFORE app.listen)

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                // Send the role back to the Frontend!
                return res.json({ 
                    success: true, 
                    message: `Welcome, ${user.username}`,
                    role: user.role 
                });
            }
        }
        res.status(401).json({ success: false, message: "Invalid credentials." });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const exists = await User.findOne({ username });
        if (exists) return res.status(400).json({ message: "User exists!" });

        // Hash the password (10 is the "salt rounds" or complexity)
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        
        res.json({ success: true, message: "Account secured and created!" });
    } catch (err) {
        res.status(500).json({ message: "Registration error" });
    }
});

const Project = mongoose.model('Project', new mongoose.Schema({
  title: String,
  description: String,
  status: { type: String, default: 'Pending' },
  createdBy: String,
  createdAt: { type: Date, default: Date.now },
  // Add this new field: an array of objects
  tasks: [{
    text: String,
    completed: { type: Boolean, default: false }
  }]
}));

// --- Project Routes ---

// Get all projects
app.get('/api/projects', async (req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  res.json(projects);
});

// Add a new project
app.post('/api/projects', async (req, res) => {
  const { title, description, createdBy } = req.body;
  const newProject = new Project({ title, description, createdBy });
  await newProject.save();
  res.json({ success: true, message: "Project added!" });
});

// Delete a project
app.delete('/api/projects/:id', async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.put('/api/projects/:id/status', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        const statusMap = { 'Pending': 'In Progress', 'In Progress': 'Completed', 'Completed': 'Pending' };
        project.status = statusMap[project.status] || 'Pending';
        await project.save();
        res.json({ success: true, newStatus: project.status });
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/api/projects/:id/tasks', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        project.tasks.push({ text: req.body.text });
        await project.save();
        res.json(project);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete Route
app.delete('/api/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Delete error" });
    }
});

// Get All Users Route (For your dashboard table)
app.get('/api/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// Add this back so the Angular "Ping" works again
app.get('/api/welcome', (req, res) => {
    res.json({ message: "Connected to Joao's Domain Backend." });
});

// --- Finance Model ---
const Finance = mongoose.model('Finance', new mongoose.Schema({
  date: { type: String, required: true },
  bank: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: String,
  createdBy: String,
  createdAt: { type: Date, default: Date.now }
}));

// --- Finance Routes ---

// Get all finance entries (sorted by date descending)
app.get('/api/finance', async (req, res) => {
  try {
    // Sorting by date descending AND createdAt descending as a backup
    const entries = await Finance.find().sort({ date: -1, createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: "Error fetching finance data" });
  }
});
// Add a new finance entry
app.post('/api/finance', async (req, res) => {
  try {
    const { date, bank, amount, category, description, createdBy } = req.body;
    const newEntry = new Finance({ 
      date, bank, amount, category, description, createdBy 
    });
    await newEntry.save();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Delete a finance transaction
app.delete('/api/finance/:id', async (req, res) => {
  try {
    await Finance.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting transaction" });
  }
});

// --- Income Model ---
const Income = mongoose.model('Income', new mongoose.Schema({
  date: String,
  source: String,
  amount: Number,
  note: String,
  createdBy: String
}));

// --- Income Routes ---
app.get('/api/income', async (req, res) => {
  const incomes = await Income.find().sort({ date: -1 });
  res.json(incomes);
});

app.post('/api/income', async (req, res) => {
  const newIncome = new Income(req.body);
  await newIncome.save();
  res.json({ success: true });
});

app.delete('/api/income/:id', async (req, res) => {
  await Income.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Update Goal Progress
app.patch('/api/goals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body; // This is the $ amount you're adding (e.g., 50)

    // Using $inc to atomically add the amount to currentAmount
    const updatedGoal = await Goal.findByIdAndUpdate(
      id,
      { $inc: { currentAmount: amount } }, 
      { new: true } // Returns the updated document so the UI can refresh immediately
    );

    if (!updatedGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. START SERVER
app.listen(PORT, () => {
    console.log(`Server is live at http://localhost:${PORT}`);
});

