require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const contactRoutes = require('./routes/contacts');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
connectDB();

// Routes
app.use('/api/contacts', contactRoutes);

// Route de test
app.get('/', (req, res) => {
  res.send('🚀 FUTURE-X VCF API');
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});