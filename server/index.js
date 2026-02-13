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
  try {
    const username = req.headers['current-user'];
    const userRole = req.headers['user-role'];

    // Apply the same logic: Admin sees all, Users see theirs.
    let query = userRole === 'Admin' ? {} : { createdBy: username };

    const trades = await Trade.find(query).sort({ date: -1 });
    res.json(trades);
  } catch (err) {
    res.status(500).json({ message: "Error fetching trades" });
  }
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
  try {
    const username = req.headers['current-user'];
    const userRole = req.headers['user-role'];

    // If Admin, find all. If User, only find theirs.
    let query = userRole === 'Admin' ? {} : { createdBy: username };

    const projects = await Project.find(query).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Error fetching projects" });
  }
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
// index.js

app.get('/api/finance', async (req, res) => {
  try {
    // 1. Get the identity from headers (sent by your new Angular code)
    const username = req.headers['current-user'];
    const userRole = req.headers['user-role'];

    // 2. Default query: find nothing (safety first)
    let query = {};

    // 3. Logic: If NOT admin, filter by their username
    if (userRole !== 'Admin') {
      query = { createdBy: username };
    } 
    // If it IS 'Admin', query stays {} (which means "find everything")

    const data = await Finance.find(query); // 'Finance' is your Mongoose model
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Add a new finance entry
app.post('/api/finance', async (req, res) => {
  try {
    // 1. Debug Logs: See exactly what is arriving and WHERE it's going
    console.log("--- New Transaction Attempt ---");
    console.log("Data:", req.body);
    console.log("Target Database:", mongoose.connection.name);
    console.log("Target Host:", mongoose.connection.host);

    const { date, bank, amount, category, description, createdBy } = req.body;

    // 2. Security Check: Prevent "Invisible" entries
    if (!createdBy) {
      console.error("CRITICAL: Transaction received without a 'createdBy' owner!");
      return res.status(400).json({ success: false, message: "User identity missing." });
    }

    const newEntry = new Finance({ 
      date, 
      bank, 
      amount, 
      category, 
      description, 
      createdBy 
    });

    // 3. Save and Confirm
    const savedDoc = await newEntry.save();
    console.log("Successfully saved to MongoDB ID:", savedDoc._id);

    res.json({ success: true, id: savedDoc._id });
  } catch (err) {
    console.error("Save error details:", err);
    res.status(500).json({ success: false, error: err.message });
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
  try {
    const username = req.headers['current-user'];
    const userRole = req.headers['user-role'];

    // Add the filter logic here too!
    let query = userRole === 'Admin' ? {} : { createdBy: username };

    const incomes = await Income.find(query).sort({ date: -1 });
    res.json(incomes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching income" });
  }
});

app.post('/api/finance', async (req, res) => {
  try {
    console.log("=== 🔍 INCOMING FINANCE POST ===");
    console.log("1. Raw Body:", JSON.stringify(req.body, null, 2));
    
    // Check Connection Info
    console.log("2. Database Name:", mongoose.connection.name);
    console.log("3. Database Host:", mongoose.connection.host);
    console.log("4. Connection State:", mongoose.connection.readyState); 
    // (0=disconnected, 1=connected, 2=connecting)

    const { date, bank, amount, category, description, createdBy } = req.body;

    if (!createdBy) {
      console.error("❌ ERROR: createdBy is missing! Data will be invisible to users.");
    }

    const newEntry = new Finance({ 
      date, 
      bank, 
      amount: parseFloat(amount), 
      category, 
      description, 
      createdBy 
    });

    const savedDoc = await newEntry.save();
    console.log("5. ✅ SUCCESS: Saved to collection 'finances'");
    console.log("6. Saved ID:", savedDoc._id);
    console.log("===============================");

    res.json({ success: true, id: savedDoc._id });
  } catch (err) {
    console.error("❌ DATABASE SAVE ERROR:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
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



