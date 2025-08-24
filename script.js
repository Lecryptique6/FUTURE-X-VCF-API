// DOM elements
const contactForm = document.getElementById('contactForm');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const submitBtn = document.getElementById('submitBtn');
const registeredCount = document.getElementById('registeredCount');
const remainingCount = document.getElementById('remainingCount');
const targetCount = document.getElementById('targetCount');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

// Load initial statistics
document.addEventListener('DOMContentLoaded', function() {
    loadStats();
});

// Form submission handler
contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const prenom = document.getElementById('prenom').value.trim();
    const numero = document.getElementById('numero').value.trim();
    
    // Basic validation
    if (!prenom || !numero) {
        showError('Veuillez remplir tous les champs.');
        return;
    }
    
    // Phone number validation
    if (!validatePhoneNumber(numero)) {
        showError('Format de numéro invalide. Utilisez le format international (ex: +237682605666).');
        return;
    }
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Enregistrement...';
    
    try {
        const response = await fetch('/api/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prenom: prenom,
                numero: numero
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showSuccess(data.message);
            updateStats(data.stats);
            contactForm.reset();
            
            // Add pulse animation to stats
            document.querySelector('.dashboard').classList.add('pulse-animation');
            setTimeout(() => {
                document.querySelector('.dashboard').classList.remove('pulse-animation');
            }, 600);
        } else {
            showError(data.error || 'Erreur lors de l\'enregistrement.');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Erreur de connexion. Veuillez réessayer.');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = '💾 Enregistrer';
    }
});

// Load statistics from server
async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        updateStats(stats);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Update statistics display
function updateStats(stats) {
    if (stats) {
        registeredCount.textContent = stats.registered || 0;
        remainingCount.textContent = stats.remaining || 100;
        targetCount.textContent = stats.target || 100;
        
        const progress = stats.progress || 0;
        progressBar.style.width = progress + '%';
        progressText.textContent = progress + '% complété';
    }
}

// Show success message
function showSuccess(message) {
    hideMessages();
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 5000);
}

// Show error message
function showError(message) {
    hideMessages();
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Hide all messages
function hideMessages() {
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
}

// Validate phone number format
function validatePhoneNumber(numero) {
    // Basic international phone number validation
    // Accepts formats like +237682605666, +33123456789, etc.
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(numero);
}

// Auto-refresh stats every 30 seconds
setInterval(loadStats, 30000);
