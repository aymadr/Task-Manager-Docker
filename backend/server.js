const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Pour crypter les mdp
const jwt = require('jsonwebtoken'); // Pour le token de connexion

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = "mon_secret_super_securise"; // À mettre dans .env normalement

// --- DB Connect ---
const connectWithRetry = () => {
  mongoose.connect('mongodb://mongo:27017/docker-linear')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => setTimeout(connectWithRetry, 5000));
};
connectWithRetry();

// --- SCHEMAS ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Developper' }
});
const User = mongoose.model('User', UserSchema);

const TaskSchema = new mongoose.Schema({
  title: String,
  status: { type: String, default: 'TODO' }, // BACKLOG, TODO, IN_PROGRESS, DONE
  priority: { type: String, default: 'NO_PRIORITY' },
  createdAt: { type: Date, default: Date.now }
});
const Task = mongoose.model('Task', TaskSchema);

// --- ROUTES AUTHENTIFICATION ---
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.json({ message: "Utilisateur créé !" });
  } catch (err) {
    res.status(400).json({ error: "Erreur création (Email déjà pris ?)" });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Utilisateur inconnu" });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ error: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user._id }, SECRET_KEY);
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Mise à jour du profil
app.put('/api/users/:id', async (req, res) => {
  try {
    const { username, role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { username, role }, { new: true });
    res.json(user);
  } catch (err) { res.status(500).json({ error: "Erreur update" }); }
});

// --- ROUTES TASKS ( inchangées ) ---
app.get('/api/tasks', async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json(tasks);
});

app.post('/api/tasks', async (req, res) => {
  const newTask = new Task(req.body);
  await newTask.save();
  res.json(newTask);
});

app.put('/api/tasks/:id/status', async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(task);
});

app.delete('/api/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.listen(5000, () => console.log(`🚀 Server running on 5000`));