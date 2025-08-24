import os
import logging
from flask import Flask, render_template, request, jsonify, send_from_directory
from pathlib import Path

# Configure logging for debugging
logging.basicConfig(level=logging.DEBUG)

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")

# Ensure contacts file exists
contacts_file = "contacts.txt"
if not os.path.exists(contacts_file):
    Path(contacts_file).touch()

@app.route('/')
def home():
    """Serve the main contact collection page"""
    return render_template('index.html')

@app.route('/api/contacts', methods=['POST'])
def save_contact():
    """API endpoint to save contacts"""
    try:
        data = request.get_json()
        
        if not data or 'prenom' not in data or 'numero' not in data:
            return jsonify({
                "success": False, 
                "error": "Données invalides. Prénom et numéro requis."
            }), 400
        
        prenom = data['prenom'].strip()
        numero = data['numero'].strip()
        
        if not prenom or not numero:
            return jsonify({
                "success": False, 
                "error": "Le prénom et le numéro ne peuvent pas être vides."
            }), 400
        
        # Check if contact already exists
        existing_contacts = []
        if os.path.exists(contacts_file):
            with open(contacts_file, "r", encoding="utf-8") as f:
                existing_contacts = [line.strip() for line in f.readlines()]
        
        contact_line = f"{prenom}⚡,{numero}"
        if contact_line in existing_contacts:
            return jsonify({
                "success": False, 
                "error": "Ce contact existe déjà."
            }), 400
        
        # Save contact to file
        with open(contacts_file, "a", encoding="utf-8") as f:
            f.write(f"{contact_line}\n")
        
        # Calculate updated stats
        registered = len(existing_contacts) + 1
        target = 100
        remaining = max(0, target - registered)
        progress = min(100, (registered / target) * 100)
        
        app.logger.info(f"Contact saved: {prenom}, {numero}")
        
        return jsonify({
            "success": True,
            "message": "✅ Contact enregistré avec succès !",
            "stats": {
                "registered": registered,
                "remaining": remaining,
                "progress": round(progress, 1),
                "target": target
            }
        })
        
    except Exception as e:
        app.logger.error(f"Error saving contact: {str(e)}")
        return jsonify({
            "success": False, 
            "error": "Erreur lors de l'enregistrement du contact."
        }), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """API endpoint to get current statistics"""
    try:
        registered = 0
        if os.path.exists(contacts_file):
            with open(contacts_file, "r", encoding="utf-8") as f:
                registered = len([line for line in f.readlines() if line.strip()])
        
        target = 100
        remaining = max(0, target - registered)
        progress = min(100, (registered / target) * 100)
        
        return jsonify({
            "registered": registered,
            "remaining": remaining,
            "progress": round(progress, 1),
            "target": target
        })
        
    except Exception as e:
        app.logger.error(f"Error getting stats: {str(e)}")
        return jsonify({
            "registered": 0,
            "remaining": 100,
            "progress": 0,
            "target": 100
        })

@app.route('/download/contacts')
def download_contacts():
    """Download contacts file"""
    try:
        if os.path.exists(contacts_file):
            return send_from_directory('.', contacts_file, as_attachment=True)
        else:
            return "Aucun contact trouvé.", 404
    except Exception as e:
        app.logger.error(f"Error downloading contacts: {str(e)}")
        return "Erreur lors du téléchargement.", 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
