const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Enregistrer un contact
router.post('/', async (req, res) => {
  try {
    const { prenom, numero } = req.body;
    const newContact = new Contact({ prenom, numero });
    await newContact.save();
    res.status(201).json({ success: true, message: "✅ Contact enregistré !" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer tous les contacts (pour admin)
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;