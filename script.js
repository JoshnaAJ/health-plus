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
    
    // Update active state in navigation
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Scroll to top when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Add click event listeners to all navigation links
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            navigateTo(sectionId);
        });
    });

    // Set home as default active section
    navigateTo('home');
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
    
    // Add Habit Tracker card
    const featuresGrid = document.querySelector('.features-grid');
    const habitTrackerCard = document.createElement('div');
    habitTrackerCard.className = 'feature-card';
    habitTrackerCard.onclick = () => navigateTo('habit-tracker');
    habitTrackerCard.innerHTML = `
        <i class="fas fa-calendar-check"></i>
        <h3>Habit Tracker</h3>
        <p>Track and maintain healthy daily habits</p>
    `;
    featuresGrid.appendChild(habitTrackerCard);
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

// Remove medication tracker functions
function toggleLifestyle(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector('.fa-chevron-down');
    
    // Close all other open sections
    document.querySelectorAll('.lifestyle-content').forEach(item => {
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

// Search functionality for lifestyle diseases
document.getElementById('diseaseSearch').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const diseaseItems = document.querySelectorAll('.lifestyle-item');

    diseaseItems.forEach(item => {
        const headerText = item.querySelector('.lifestyle-header h3').textContent.toLowerCase();
        const contentText = item.querySelector('.lifestyle-content').textContent.toLowerCase();
        
        if (headerText.includes(searchTerm) || contentText.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
});

// Habit Tracker Functionality
let habits = [];
let currentDate = new Date();
let moodData = JSON.parse(localStorage.getItem('moodData')) || {};

function addHabit() {
    if (habits.length >= 5) {
        alert('You can only track up to 5 habits at a time');
        return;
    }

    const habitName = document.getElementById('habit-name').value.trim();
    const category = document.getElementById('habit-category').value;

    if (!habitName) {
        alert('Please enter a habit name');
        return;
    }

    const habit = {
        id: Date.now(),
        name: habitName,
        category: category,
        completedDates: [],
        currentStreak: 0,
        bestStreak: 0
    };

    habits.push(habit);
    document.getElementById('habit-name').value = '';
    updateHabitsList();
    updateCalendar();
    saveHabits();
}

function updateHabitsList() {
    const container = document.getElementById('habits-container');
    container.innerHTML = habits.map(habit => `
        <div class="habit-item" data-id="${habit.id}">
            <div class="habit-info">
                <i class="fas fa-${getCategoryIcon(habit.category)}"></i>
                <span>${habit.name}</span>
            </div>
            <button onclick="deleteHabit(${habit.id})" class="delete-btn">
                <i class="fas fa-trash"></i>
                Delete
            </button>
        </div>
    `).join('');
}

function getCategoryIcon(category) {
    const icons = {
        exercise: 'running',
        nutrition: 'apple-alt',
        mindfulness: 'brain',
        sleep: 'moon',
        other: 'star'
    };
    return icons[category] || 'star';
}

function deleteHabit(id) {
    if (confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
        habits = habits.filter(h => h.id !== id);
        updateHabitsList();
        updateCalendar();
        updateStats();
        saveHabits();
    }
}

function updateCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    document.getElementById('current-month').textContent = 
        new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);

    const calendarDates = document.getElementById('calendar-dates');
    calendarDates.innerHTML = '';

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
        calendarDates.appendChild(createDateCell(''));
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const cell = createDateCell(day, date);
        calendarDates.appendChild(cell);
    }

    updateStats();
}

function createDateCell(day, date) {
    const cell = document.createElement('div');
    cell.className = 'calendar-date';
    
    if (!day) {
        cell.textContent = '';
        return cell;
    }

    const dateStr = date.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    // Create date number element
    const dateNumber = document.createElement('span');
    dateNumber.textContent = day;
    cell.appendChild(dateNumber);

    // Add mood icon if exists for this date
    if (moodData[dateStr]) {
        const moodContainer = document.createElement('div');
        moodContainer.className = 'mood-container';
        
        const moodIcon = document.createElement('i');
        moodIcon.className = `fas fa-${moodData[dateStr]}`;
        moodIcon.style.fontSize = '1rem';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-mood-btn';
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.title = 'Delete mood';
        deleteBtn.onclick = (e) => {
            e.stopPropagation(); // Prevent cell click event
            deleteMoodEntry(dateStr);
        };

        moodContainer.appendChild(moodIcon);
        moodContainer.appendChild(deleteBtn);
        cell.appendChild(moodContainer);
    }

    // Check for habits completed on this date
    const hasCompletedHabits = habits.some(habit => 
        habit.completedDates.includes(dateStr)
    );

    if (hasCompletedHabits) {
        cell.classList.add('completed');
    }

    if (dateStr === today) {
        cell.classList.add('active');
    }

    // Add click handler for mood notes display
    cell.addEventListener('click', (e) => {
        if (e.target.closest('.delete-mood-btn')) return; // Ignore if delete button was clicked
        
        if (moodData[dateStr]) {
            showMoodNotes(dateStr);
        }
        toggleHabitCompletion(date);
    });

    return cell;
}

function toggleHabitCompletion(date) {
    habits.forEach(habit => {
        const index = habit.completedDates.indexOf(date.toISOString().split('T')[0]);
        if (index === -1) {
            habit.completedDates.push(date.toISOString().split('T')[0]);
        } else {
            habit.completedDates.splice(index, 1);
        }
        calculateStreak(habit);
    });
    
    updateCalendar();
    saveHabits();
}

function calculateStreak(habit) {
    let currentStreak = 0;
    let bestStreak = habit.bestStreak;
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        if (habit.completedDates.includes(dateStr)) {
            currentStreak++;
            if (currentStreak > bestStreak) {
                bestStreak = currentStreak;
            }
        } else {
            break;
        }
    }

    habit.currentStreak = currentStreak;
    habit.bestStreak = bestStreak;
}

function updateStats() {
    let totalCompleted = 0;
    let totalPossible = 0;
    let maxCurrentStreak = 0;
    let maxBestStreak = 0;

    habits.forEach(habit => {
        totalCompleted += habit.completedDates.length;
        totalPossible += getDaysTracked(habit);
        maxCurrentStreak = Math.max(maxCurrentStreak, habit.currentStreak);
        maxBestStreak = Math.max(maxBestStreak, habit.bestStreak);
    });

    const completionRate = totalPossible ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    document.getElementById('current-streak').textContent = `${maxCurrentStreak} days`;
    document.getElementById('best-streak').textContent = `${maxBestStreak} days`;
    document.getElementById('completion-rate').textContent = `${completionRate}%`;
}

function getDaysTracked(habit) {
    const firstDate = new Date(Math.min(...habit.completedDates.map(d => new Date(d))));
    const today = new Date();
    return Math.ceil((today - firstDate) / (1000 * 60 * 60 * 24)) || 1;
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
}

function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

function loadHabits() {
    const savedHabits = localStorage.getItem('habits');
    if (savedHabits) {
        habits = JSON.parse(savedHabits);
        updateHabitsList();
        updateCalendar();
    }

    // Load mood data
    const savedMoodData = localStorage.getItem('moodData');
    if (savedMoodData) {
        moodData = JSON.parse(savedMoodData);
    }
}

// Initialize habit tracker
document.addEventListener('DOMContentLoaded', () => {
    loadHabits();
    // ... existing initialization code ...
});

// Mental Health Support System
const MentalHealthSupport = {
    init() {
        this.initMoodTracker();
        this.initMeditationTimer();
        this.loadMoodHistory();
    },

    initMoodTracker() {
        const moodButtons = document.querySelectorAll('.mood-btn');
        const saveButton = document.getElementById('saveMood');
        
        moodButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                moodButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        saveButton.addEventListener('click', () => {
            const selectedMood = document.querySelector('.mood-btn.active');
            const notes = document.getElementById('moodNotes').value;
            
            if (selectedMood) {
                this.saveMoodEntry(selectedMood.dataset.mood, notes);
            }
        });
    },

    saveMoodEntry(mood, notes) {
        const entry = {
            mood,
            notes,
            date: new Date().toISOString()
        };

        const moodHistory = JSON.parse(localStorage.getItem('moodHistory') || '[]');
        moodHistory.push(entry);
        localStorage.setItem('moodHistory', JSON.stringify(moodHistory));

        // Save mood to calendar data
        const today = new Date().toISOString().split('T')[0];
        moodData[today] = getMoodIcon(mood);
        localStorage.setItem('moodData', JSON.stringify(moodData));

        updateCalendar(); // Update calendar display
        showNotification('Mood saved successfully!');
    },

    initMeditationTimer() {
        let timer;
        let timeLeft = 300; // 5 minutes in seconds
        
        const startBtn = document.getElementById('startMeditation');
        const pauseBtn = document.getElementById('pauseMeditation');
        const resetBtn = document.getElementById('resetMeditation');

        startBtn.addEventListener('click', () => {
            timer = setInterval(() => {
                timeLeft--;
                this.updateTimerDisplay(timeLeft);
                
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    this.showNotification('Meditation session completed!');
                }
            }, 1000);

            startBtn.disabled = true;
            pauseBtn.disabled = false;
        });

        // Add pause and reset functionality
    },

    updateTimerDisplay(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        document.getElementById('minutes').textContent = 
            String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = 
            String(remainingSeconds).padStart(2, '0');
    }
};

// Medication Reminder System
const MedicationReminder = {
    init() {
        this.initForm();
        this.loadMedications();
        this.checkPermissions();
    },

    initForm() {
        const form = document.getElementById('medicationForm');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const medication = {
                name: document.getElementById('medName').value,
                dosage: document.getElementById('medDosage').value,
                frequency: document.getElementById('medFrequency').value,
                time: document.getElementById('medTime').value,
                id: Date.now()
            };

            this.addMedication(medication);
            form.reset();
        });
    },

    addMedication(medication) {
        const medications = this.getMedications();
        medications.push(medication);
        localStorage.setItem('medications', JSON.stringify(medications));
        
        this.scheduleReminder(medication);
        this.renderMedications();
    },

    scheduleReminder(medication) {
        if (Notification.permission === 'granted') {
            const [hours, minutes] = medication.time.split(':');
            const now = new Date();
            const scheduledTime = new Date();
            
            scheduledTime.setHours(hours, minutes, 0);
            
            if (scheduledTime < now) {
                scheduledTime.setDate(scheduledTime.getDate() + 1);
            }

            const timeUntilReminder = scheduledTime - now;
            
            setTimeout(() => {
                new Notification('Medication Reminder', {
                    body: `Time to take ${medication.name} - ${medication.dosage}`,
                    icon: '/path/to/icon.png'
                });
            }, timeUntilReminder);
        }
    },

    renderMedications() {
        const medications = this.getMedications();
        const container = document.getElementById('medicationList');
        
        container.innerHTML = medications.map(med => `
            <div class="medication-item">
                <div class="medication-info">
                    <h4>${med.name}</h4>
                    <p>${med.dosage} - ${med.frequency} at ${med.time}</p>
                </div>
                <div class="medication-actions">
                    <button onclick="MedicationReminder.deleteMedication(${med.id})"
                            class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    getMedications() {
        return JSON.parse(localStorage.getItem('medications') || '[]');
    },

    deleteMedication(id) {
        const medications = this.getMedications().filter(med => med.id !== id);
        localStorage.setItem('medications', JSON.stringify(medications));
        this.renderMedications();
    },

    async checkPermissions() {
        if (Notification.permission !== 'granted') {
            await Notification.requestPermission();
        }
    }
};

// Initialize both systems
document.addEventListener('DOMContentLoaded', () => {
    MentalHealthSupport.init();
    MedicationReminder.init();
});

// Add function to get mood icon
function getMoodIcon(mood) {
    const moodIcons = {
        'great': 'laugh-beam',
        'good': 'smile',
        'okay': 'meh',
        'bad': 'frown',
        'terrible': 'sad-tear'
    };
    return moodIcons[mood] || 'smile';
}

// Update the existing loadHabits function
function loadHabits() {
    const savedHabits = localStorage.getItem('habits');
    if (savedHabits) {
        habits = JSON.parse(savedHabits);
        updateHabitsList();
        updateCalendar();
    }

    // Load mood data
    const savedMoodData = localStorage.getItem('moodData');
    if (savedMoodData) {
        moodData = JSON.parse(savedMoodData);
    }
}

// Update saveMood button event listener
document.getElementById('saveMood').addEventListener('click', () => {
    const selectedMood = document.querySelector('.mood-btn.active');
    const notes = document.getElementById('moodNotes').value;
    
    if (selectedMood) {
        saveMoodEntry(selectedMood.dataset.mood, notes);
        document.getElementById('moodNotes').value = '';
        document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('active'));
    } else {
        showNotification('Please select a mood first!', 'error');
    }
});

// Update the calendar CSS styles
const calendarStyles = document.createElement('style');
calendarStyles.textContent = `
    .calendar-date {
        position: relative;
        min-height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 0.5rem;
    }

    .calendar-date i {
        color: var(--color-primary);
    }

    .calendar-date.completed i {
        color: white;
    }
`;
document.head.appendChild(calendarStyles);

// Remove Chibi Guide functionality
const chibiMessages = {
    'home': "Welcome! Let me show you around! 💝",
    'symptom-checker': "Tell me how you're feeling! 🏥",
    'bmi-calculator': "Let's check your BMI! 📊",
    'lifestyle-diseases': "Stay healthy with these tips! 💪",
    'habit-tracker': "Track your healthy habits! ✨",
    'first-aid-guide': "Safety first! Let me help! 🚑",
    'health-tips': "Here are some helpful tips! 💡"
};

function updateChibiMessage(sectionId) {
    const speechBubble = document.querySelector('.chibi-speech-bubble p');
    const chibiGuide = document.querySelector('.chibi-guide');
    
    // Update message
    speechBubble.textContent = chibiMessages[sectionId] || chibiMessages['home'];
    
    // Show message temporarily
    chibiGuide.style.opacity = '1';
    speechBubble.style.opacity = '1';
    speechBubble.style.transform = 'translateY(0)';
    
    // Hide message after 3 seconds
    setTimeout(() => {
        speechBubble.style.opacity = '0';
        speechBubble.style.transform = 'translateY(10px)';
    }, 3000);
}

// Remove click interaction for chibi character
document.addEventListener('DOMContentLoaded', () => {
    const chibiCharacter = document.querySelector('.chibi-character');
    const speechBubble = document.querySelector('.chibi-speech-bubble');
    
    chibiCharacter.addEventListener('click', () => {
        speechBubble.style.opacity = '1';
        speechBubble.style.transform = 'translateY(0)';
        
        // Add bounce animation to chibi
        chibiCharacter.style.animation = 'none';
        chibiCharacter.offsetHeight; // Trigger reflow
        chibiCharacter.style.animation = 'float 3s ease-in-out infinite';
    });
    
    // Show initial message
    updateChibiMessage('home');
});

// Remove chibi guide visibility functions
function updateChibiVisibility() {
    const chibiGuide = document.querySelector('.chibi-guide');
    chibiGuide.style.display = 'none'; // Hide by default
}

// Remove show chibi on nav hover
document.querySelector('.nav-links').addEventListener('mouseenter', () => {
    const chibiGuide = document.querySelector('.chibi-guide');
    chibiGuide.style.display = 'flex';
    updateChibiMessage(document.querySelector('.section.active').id);
});

document.querySelector('.nav-links').addEventListener('mouseleave', () => {
    const chibiGuide = document.querySelector('.chibi-guide');
    chibiGuide.style.display = 'none';
});

// Remove initialize chibi visibility
document.addEventListener('DOMContentLoaded', () => {
    updateChibiVisibility();
    // ... existing initialization code ...
});

// Add function to delete mood entry
function deleteMoodEntry(dateStr) {
    if (confirm('Are you sure you want to delete this mood entry?')) {
        // Get mood history
        const moodHistory = JSON.parse(localStorage.getItem('moodHistory') || '[]');
        
        // Remove from mood history
        const updatedHistory = moodHistory.filter(entry => 
            entry.date.split('T')[0] !== dateStr
        );
        
        // Remove from mood data
        delete moodData[dateStr];
        
        // Save updates
        localStorage.setItem('moodHistory', JSON.stringify(updatedHistory));
        localStorage.setItem('moodData', JSON.stringify(moodData));
        
        // Update calendar
        updateCalendar();
        showNotification('Mood entry deleted successfully!');
    }
}

// Add function to show mood notes
function showMoodNotes(dateStr) {
    const moodHistory = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    const entry = moodHistory.find(entry => entry.date.split('T')[0] === dateStr);
    
    if (entry) {
        // Create and show modal
        const modal = document.createElement('div');
        modal.className = 'mood-notes-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'mood-notes-content';
        
        const date = new Date(dateStr).toLocaleDateString();
        const mood = Object.keys(moodIcons).find(key => moodIcons[key] === moodData[dateStr]);
        
        modalContent.innerHTML = `
            <h3>Mood Entry for ${date}</h3>
            <p class="mood-display">
                <i class="fas fa-${moodData[dateStr]}"></i>
                <span>${mood.charAt(0).toUpperCase() + mood.slice(1)}</span>
            </p>
            <div class="notes-section">
                <h4>Notes:</h4>
                <p>${entry.notes || 'No notes added'}</p>
            </div>
            <div class="modal-actions">
                <button class="delete-entry-btn" onclick="deleteMoodEntry('${dateStr}')">
                    <i class="fas fa-trash"></i> Delete Entry
                </button>
                <button class="close-modal-btn">Close</button>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Close modal when clicking outside or on close button
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('close-modal-btn')) {
                modal.remove();
            }
        });
    }
} 