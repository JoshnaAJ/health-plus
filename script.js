// Replace with your actual Gemini API key
const API_KEY = 'AIzaSyBq2s3p6PoT3BBn_MTF-llAAnfLwAW3KGA';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Navigation
function navigateTo(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update active nav link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
        }
    });
}

// Handle navigation links
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = e.currentTarget.getAttribute('href').substring(1);
        navigateTo(sectionId);
    });
});

// Symptom Checker Chat
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Auto-resize textarea
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    if (this.rows > 5) this.rows = 5;
});

// Send message on Enter
userInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendButton.addEventListener('click', sendMessage);

function createMessageElement(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
    messageDiv.textContent = text;
    return messageDiv;
}

async function sendMessage() {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    // Add user message
    chatMessages.appendChild(createMessageElement(userMessage, true));
    userInput.value = '';
    userInput.style.height = 'auto';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        // Show loading
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('message', 'bot-message');
        loadingDiv.textContent = 'Analyzing your symptoms...';
        chatMessages.appendChild(loadingDiv);

        // Customize the prompt for health-specific responses
        const healthPrompt = `As a healthcare assistant, analyze these symptoms and provide possible causes, remedies, and when to seek professional help: ${userMessage}`;

        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: healthPrompt
                    }]
                }]
            })
        });

        const data = await response.json();
        chatMessages.removeChild(loadingDiv);

        if (data.candidates && data.candidates[0].content) {
            const botResponse = data.candidates[0].content.parts[0].text;
            chatMessages.appendChild(createMessageElement(botResponse, false));
        } else {
            throw new Error('Invalid response from API');
        }
    } catch (error) {
        console.error('Error:', error);
        chatMessages.appendChild(
            createMessageElement('Sorry, I encountered an error analyzing your symptoms. Please try again or consult a healthcare professional.', false)
        );
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// BMI Calculator
function calculateBMI() {
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value) / 100; // Convert cm to m
    const resultDiv = document.getElementById('bmi-result');

    if (!weight || !height || weight <= 0 || height <= 0) {
        resultDiv.innerHTML = '<p class="error">Please enter valid weight and height values.</p>';
        return;
    }

    const bmi = weight / (height * height);
    let category;
    let color;

    if (bmi < 18.5) {
        category = 'Underweight';
        color = '#FFDB5C';
    } else if (bmi < 25) {
        category = 'Normal weight';
        color = '#C3FF93';
    } else if (bmi < 30) {
        category = 'Overweight';
        color = '#FFAF61';
    } else {
        category = 'Obese';
        color = '#FF70AB';
    }

    resultDiv.innerHTML = `
        <div style="background-color: ${color}; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
            <h3>Your BMI: ${bmi.toFixed(1)}</h3>
            <p>Category: ${category}</p>
        </div>
    `;
}

// Medication Tracker
const medications = [];

function addMedication() {
    const name = document.getElementById('med-name').value.trim();
    const time = document.getElementById('med-time').value;
    
    if (!name || !time) {
        alert('Please enter both medication name and time');
        return;
    }

    medications.push({ name, time });
    updateMedicationsList();
    
    // Clear inputs
    document.getElementById('med-name').value = '';
    document.getElementById('med-time').value = '';
}

function updateMedicationsList() {
    const list = document.getElementById('medications-list');
    list.innerHTML = '';
    
    medications.sort((a, b) => a.time.localeCompare(b.time)).forEach((med, index) => {
        const item = document.createElement('div');
        item.className = 'medication-item';
        item.innerHTML = `
            <div>
                <strong>${med.name}</strong>
                <span>${med.time}</span>
            </div>
            <button onclick="deleteMedication(${index})" class="delete-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        list.appendChild(item);
    });
}

function deleteMedication(index) {
    medications.splice(index, 1);
    updateMedicationsList();
}

// Health Tips
const healthTips = [
    "Stay hydrated by drinking at least 8 glasses of water daily",
    "Get 7-9 hours of sleep each night",
    "Exercise for at least 30 minutes daily",
    "Eat a balanced diet rich in fruits and vegetables",
    "Practice mindfulness or meditation to reduce stress",
    "Take regular breaks when working at a computer",
    "Maintain good posture throughout the day",
    "Wash your hands frequently to prevent infections"
];

function updateDailyTip() {
    const tipCard = document.getElementById('daily-tip');
    const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];
    tipCard.innerHTML = `
        <h3>Tip of the Day</h3>
        <p>${randomTip}</p>
    `;
}

// First Aid Guide Functionality
function toggleFirstAid(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector('.fa-chevron-down');
    
    // Close all other open sections
    document.querySelectorAll('.first-aid-content').forEach(item => {
        if (item !== content && item.classList.contains('active')) {
            item.classList.remove('active');
            item.previousElementSibling.querySelector('.fa-chevron-down').style.transform = 'rotate(0deg)';
        }
    });

    // Toggle current section
    content.classList.toggle('active');
    
    // Rotate icon
    if (content.classList.contains('active')) {
        icon.style.transform = 'rotate(180deg)';
    } else {
        icon.style.transform = 'rotate(0deg)';
    }
}

// Add First Aid card to home page
function addFirstAidCard() {
    const featuresGrid = document.querySelector('.features-grid');
    const firstAidCard = document.createElement('div');
    firstAidCard.className = 'feature-card';
    firstAidCard.onclick = () => navigateTo('first-aid-guide');
    firstAidCard.innerHTML = `
        <i class="fas fa-kit-medical"></i>
        <h3>First Aid Guide</h3>
        <p>Quick access to emergency first aid procedures</p>
    `;
    featuresGrid.appendChild(firstAidCard);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    navigateTo('home');
    updateDailyTip();
    addFirstAidCard();
    
    // Update tip every 24 hours
    setInterval(updateDailyTip, 24 * 60 * 60 * 1000);
});

// Search functionality for first aid topics
document.getElementById('firstAidSearch').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const firstAidItems = document.querySelectorAll('.first-aid-item');

    firstAidItems.forEach(item => {
        const headerText = item.querySelector('.first-aid-header h3').textContent.toLowerCase();
        const contentText = item.querySelector('.first-aid-content').textContent.toLowerCase();
        
        if (headerText.includes(searchTerm) || contentText.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}); 