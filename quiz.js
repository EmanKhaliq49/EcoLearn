const API_BASE = "https://ecolearn-ai-dgewhwhbcxanepg6.centralindia-01.azurewebsites.net";
let currentUser = "";
let questions = [];
let currentQuestionIndex = 0;
// Use a Map to store answers
let userAnswers = new Map();

// Start Quiz
async function startQuiz() {
    const username = document.getElementById("username").value.trim();
    if (!username) {
        alert("Please enter your name!");
        return;
    }
    currentUser = username;

    try {
        const res = await fetch(`${API_BASE}/quiz/start`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `username=${encodeURIComponent(username)}`
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        questions = data.questions;

        if (!questions || questions.length === 0) {
            alert("Failed to load quiz. Try again.");
            return;
        }

        // Initialize quiz state
        currentQuestionIndex = 0;
        userAnswers = new Map();

        document.getElementById("start-section").style.display = "none";
        document.getElementById("quiz-section").style.display = "block";
        
        // Show username in header
        const usernameDisplay = document.getElementById("username-display");
        usernameDisplay.textContent = `Playing as: ${username}`;
        usernameDisplay.style.display = "block";
        
        renderQuestion();

    } catch (error) {
        console.error("Error starting quiz:", error);
        alert("An error occurred while starting the quiz.");
    }
}

// Render a single question card
function renderQuestion() {
    const qContainer = document.getElementById("quiz-card-container");
    const q = questions[currentQuestionIndex];

    // Check if an answer for this question already exists
    const selectedAnswer = userAnswers.get(currentQuestionIndex);

    qContainer.innerHTML = `
        <div class="quiz-card active">
            <div class="question">Q${currentQuestionIndex + 1}: ${q.question}</div>
            <div class="options">
                ${q.options.map((opt, i) => {
                    const letterMatch = opt.match(/^[A-D]\./);
                    const letter = letterMatch ? letterMatch[0].charAt(0) : String.fromCharCode(65 + i);
                    const text = opt.replace(/^[A-D]\.\s*/, '');
                    // Check if this option should be pre-selected
                    const checked = selectedAnswer === letter ? 'checked' : '';
                    return `
                        <label>
                            <input type="radio" name="q${currentQuestionIndex}" value="${letter}" ${checked} onchange="saveAnswer()">
                            <span>${letter}. ${text}</span>
                        </label>
                    `;
                }).join("")}
            </div>
        </div>
    `;
    updateNavigationButtons();
    
    // Add event listeners to radio buttons
    const radioButtons = document.querySelectorAll(`input[name="q${currentQuestionIndex}"]`);
    radioButtons.forEach(radio => {
        radio.addEventListener('change', saveAnswer);
    });
}

// Save the user's selected answer for the current question
function saveAnswer() {
    const selected = document.querySelector(`input[name="q${currentQuestionIndex}"]:checked`);
    if (selected) {
        userAnswers.set(currentQuestionIndex, selected.value);
        console.log(`Saved answer for question ${currentQuestionIndex}: ${selected.value}`);
        
        // Add visual feedback - make entire option button green
        const allLabels = document.querySelectorAll(`input[name="q${currentQuestionIndex}"]`);
        allLabels.forEach(radio => {
            const label = radio.parentElement;
            if (radio.checked) {
                label.classList.add('selected');
            } else {
                label.classList.remove('selected');
            }
        });
        console.log(`Answer selected: ${selected.value}`);
    }
}

// Make saveAnswer globally accessible
window.saveAnswer = saveAnswer;

// Show the next question
function showNextQuestion() {
    saveAnswer(); // Save the current answer before moving
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    }
}

// Show the previous question
function showPrevQuestion() {
    saveAnswer(); // Save the current answer before moving
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    }
}

// Update the visibility of navigation and submit buttons
function updateNavigationButtons() {
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const submitContainer = document.getElementById("submit-container");

    prevBtn.style.display = currentQuestionIndex === 0 ? "none" : "inline-block";
    nextBtn.style.display = currentQuestionIndex === questions.length - 1 ? "none" : "inline-block";
    submitContainer.style.display = currentQuestionIndex === questions.length - 1 ? "block" : "none";
}

// Submit Quiz
async function submitQuiz() {
    saveAnswer(); // Save the last question's answer
    
    // Convert the Map to an array of objects
    const answers = Array.from(userAnswers, ([key, value]) => ({ q: key, ans: value }));

    if (answers.length !== questions.length) {
        if (!confirm("Some questions are unanswered. Submit anyway?")) {
            return;
        }
    }

    try {
        const res = await fetch(`${API_BASE}/quiz/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: currentUser,
                answers: JSON.stringify(answers)
            })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "An error occurred during submission.");
            return;
        }

        // Show result
        document.getElementById("quiz-section").style.display = "none";
        document.getElementById("result-section").style.display = "block";
        document.getElementById("score").innerText = `You scored ${data.score} / ${data.total}`;

        // Badge system (medal only)
        let badge = "";
        let badgeClass = "";
        if (data.score === data.total) {
            badge = "Gold";
            badgeClass = "badge-gold";
        } else if (data.score >= Math.ceil(data.total * 0.6)) {
            badge = "Silver";
            badgeClass = "badge-silver";
        } else {
            badge = "Bronze";
            badgeClass = "badge-bronze";
        }
        const badgeEl = document.getElementById("badge");
        badgeEl.innerText = badge;
        badgeEl.classList.remove("badge-gold","badge-silver","badge-bronze");
        if (badgeClass) badgeEl.classList.add(badgeClass);
        try {
            localStorage.setItem('eco_quiz_score', `${data.score}/${data.total}`);
            localStorage.setItem('eco_quiz_badge', badge);
        } catch {}

        // Persist to localStorage for Share card
        try {
            const key = 'ecolearn-impact';
            const existing = JSON.parse(localStorage.getItem(key) || '{}');
            const updated = { ...existing, score: `${data.score}/${data.total}`, badge: badge };
            localStorage.setItem(key, JSON.stringify(updated));
        } catch {}

        loadLeaderboard();

    } catch (error) {
        console.error("Error submitting quiz:", error);
        alert("An error occurred while submitting the quiz.");
    }
}

// Load Leaderboard
async function loadLeaderboard() {
    try {
        // Show the leaderboard section
        document.getElementById("leaderboard-section").style.display = "block";

        const res = await fetch(`${API_BASE}/quiz/leaderboard`);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        const list = document.getElementById("leaderboard-list");
        list.innerHTML = "";
        data.leaderboard.forEach(entry => {
            const li = document.createElement("li");
            li.textContent = `${entry.username}: ${entry.score}`;
            list.appendChild(li);
        });
    } catch (error) {
        console.error("Error loading leaderboard:", error);
    }
}

