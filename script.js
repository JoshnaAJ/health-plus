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

    if (isUser) {
        messageDiv.textContent = text;
    } else {
        // Format bot response
        let formattedText = text
            // Format headings
            .replace(/([A-Z][A-Za-z\s]+):/g, '<strong>$1:</strong>')
            // Format lists
            .replace(/•\s(.*?)(?=(?:•|\n|$))/g, '<li>$1</li>')
            // Format important terms
            .replace(/\*\*(.*?)\*\*/g, '<span class="highlight">$1</span>')
            // Format warnings
            .replace(/(!.*?\.)/g, '<div class="warning">$1</div>')
            // Add line breaks for readability
            .replace(/\n{2,}/g, '<hr>');

        // Wrap lists in ul tags
        if (formattedText.includes('<li>')) {
            formattedText = formattedText.replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>');
        }

        messageDiv.innerHTML = formattedText;
    }

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
        const healthPrompt = `
            As a healthcare assistant, analyze these symptoms and provide a clear, structured response with:
            
            Possible Causes:
            • List top potential causes
            
            Recommended Actions:
            • Immediate steps to take
            
            When to Seek Medical Help:
            • Clear warning signs
            
            Home Remedies:
            • Safe self-care measures
            
            Analyze this: ${userMessage}
            
            Format with bullet points and clear headings. Mark important terms with ** and warnings with !
        `;

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
    let category, color, recommendations;

    if (bmi < 18.5) {
        category = 'Underweight';
        color = '#FFDB5C';
        recommendations = {
            diet: [
                "Increase caloric intake by 300-500 calories daily",
                "Eat protein-rich foods (eggs, lean meat, fish)",
                "Include healthy fats (nuts, avocados, olive oil)",
                "Have frequent meals (5-6 times per day)",
                "Add protein smoothies and nutritious snacks"
            ],
            exercise: [
                "Focus on strength training",
                "Limit cardio exercises",
                "Do compound exercises (squats, deadlifts)",
                "Take adequate rest between workouts",
                "Gradually increase workout intensity"
            ],
            lifestyle: [
                "Track your daily calorie intake",
                "Get adequate sleep (7-9 hours)",
                "Reduce stress levels",
                "Stay hydrated",
                "Consider nutritional supplements (consult doctor)"
            ],
            medical: [
                "Consult a nutritionist",
                "Get thyroid function checked",
                "Monitor vitamin D and B12 levels",
                "Check for underlying conditions",
                "Regular health check-ups"
            ]
        };
    } else if (bmi < 25) {
        category = 'Normal weight';
        color = '#C3FF93';
        recommendations = {
            diet: [
                "Maintain balanced diet",
                "Include variety of fruits and vegetables",
                "Choose whole grains",
                "Moderate portion sizes",
                "Stay hydrated"
            ],
            exercise: [
                "Regular physical activity",
                "Mix of cardio and strength training",
                "30 minutes exercise daily",
                "Include flexibility exercises",
                "Stay active throughout day"
            ],
            lifestyle: [
                "Maintain current healthy habits",
                "Regular sleep schedule",
                "Stress management",
                "Regular health check-ups",
                "Stay socially active"
            ]
        };
    } else if (bmi < 30) {
        category = 'Overweight';
        color = '#FFAF61';
        recommendations = {
            diet: [
                "Reduce caloric intake by 500 calories",
                "Increase protein and fiber intake",
                "Limit processed foods and sugars",
                "Control portion sizes",
                "Plan meals in advance"
            ],
            exercise: [
                "30-45 minutes cardio daily",
                "Include strength training",
                "Try HIIT workouts",
                "Walking 10,000 steps daily",
                "Join group fitness classes"
            ],
            lifestyle: [
                "Track food intake",
                "Get adequate sleep",
                "Manage stress levels",
                "Find workout buddy",
                "Set realistic goals"
            ],
            medical: [
                "Regular blood pressure checks",
                "Monitor cholesterol levels",
                "Consider nutritionist consultation",
                "Track progress regularly",
                "Check for sleep apnea"
            ]
        };
    } else {
        category = 'Obese';
        color = '#FF70AB';
        recommendations = {
            diet: [
                "Consult registered dietitian",
                "Create caloric deficit safely",
                "Focus on whole, unprocessed foods",
                "Increase protein and fiber intake",
                "Eliminate sugary drinks"
            ],
            exercise: [
                "Start with low-impact exercises",
                "Daily walking routine",
                "Swimming or water aerobics",
                "Gradual increase in activity",
                "Consider personal trainer"
            ],
            lifestyle: [
                "Keep food and activity journal",
                "Join support groups",
                "Stress management techniques",
                "Regular sleep schedule",
                "Set small, achievable goals"
            ],
            medical: [
                "Regular doctor check-ups",
                "Monitor blood pressure",
                "Check blood sugar levels",
                "Screen for sleep apnea",
                "Consider weight management program"
            ]
        };
    }

    let recommendationsHTML = '';
    if (category !== 'Normal weight') {
        recommendationsHTML = `
            <div class="recommendations-container">
                <h3>Personalized Health Recommendations</h3>
                <div class="recommendations-grid">
                    ${Object.entries(recommendations).map(([key, items]) => `
                        <div class="recommendation-card">
                            <h4>${key.charAt(0).toUpperCase() + key.slice(1)} Plan</h4>
                            <ul>
                                ${items.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    resultDiv.innerHTML = `
        <div style="background-color: ${color}; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
            <h3>Your BMI: ${bmi.toFixed(1)}</h3>
            <p>Category: ${category}</p>
        </div>
        ${recommendationsHTML}
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
    "Wash your hands frequently to prevent infections",
    "Include protein-rich foods in every meal for muscle health",
    "Practice deep breathing exercises for stress relief",
    "Take a 10-minute walk after each meal to aid digestion",
    "Limit screen time before bedtime for better sleep",
    "Incorporate strength training exercises twice a week",
    "Stay socially connected with friends and family",
    "Practice portion control during meals",
    "Get regular health check-ups and screenings",
    "Maintain a consistent sleep schedule",
    "Include omega-3 rich foods in your diet",
    "Practice good dental hygiene twice daily",
    "Take breaks to stretch every hour while working",
    "Stay up to date with vaccinations",
    "Listen to your body and rest when needed",
    "Keep a gratitude journal for mental wellness",
    "Include colorful vegetables in your meals"
];

const fitnessQuotes = [
    "The only bad workout is the one that didn't happen.",
    "Your health is an investment, not an expense.",
    "Take care of your body. It's the only place you have to live.",
    "Fitness is not about being better than someone else. It's about being better than you used to be.",
    "The difference between try and triumph is a little umph.",
    "Your body can stand almost anything. It's your mind that you have to convince.",
    "The hardest lift of all is lifting your butt off the couch.",
    "Strive for progress, not perfection.",
    "Your body achieves what your mind believes.",
    "The only way to do great work is to love what you do."
];

function updateDailyTip() {
    const tipCard = document.getElementById('daily-tip');
    const tipsGrid = document.getElementById('tips-grid');
    
    // Display one featured tip
    const featuredTip = healthTips[Math.floor(Math.random() * healthTips.length)];
    tipCard.innerHTML = `
        <div class="tip-section">
            <h3>Featured Health Tip</h3>
            <p>${featuredTip}</p>
        </div>
    `;

    // Shuffle the tips array for random display
    const shuffledTips = [...healthTips].sort(() => Math.random() - 0.5);
    
    // Display multiple tips in the grid
    tipsGrid.innerHTML = shuffledTips.map(tip => `
        <div class="tip-card">
            <div class="tip-content">
                <i class="fas fa-check-circle"></i>
                <p>${tip}</p>
            </div>
        </div>
    `).join('');
}

function updateFitnessQuote() {
    const quoteSection = document.getElementById('fitness-quote-section');
    const randomQuote = fitnessQuotes[Math.floor(Math.random() * fitnessQuotes.length)];
    quoteSection.innerHTML = `
        <div class="quote-section">
            <h3>Fitness Quote of the Day</h3>
            <p class="fitness-quote">${randomQuote}</p>
        </div>
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
    updateFitnessQuote();
    addFirstAidCard();
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