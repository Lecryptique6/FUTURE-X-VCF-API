const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  prenom: { type: String, required: true },
  numero: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contact', ContactSchema);