const API_BASE = "https://ecolearn-ai-dgewhwhbcxanepg6.centralindia-01.azurewebsites.net"; // adjust if needed

const chatPanel = document.getElementById("chatPanel");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const languageSelect = document.getElementById("languageSelect");
const ageSelect = document.getElementById("ageSelect");
const micBtn = document.getElementById("micBtn");

// Convert simple markdown to plain text (remove *, _, headings, bullets)
function markdownToPlain(input) {
  if (!input || typeof input !== "string") return input;
  let out = input;
  // Remove code fences/backticks
  out = out.replace(/```[\s\S]*?```/g, "");
  out = out.replace(/`([^`]*)`/g, "$1");
  // Remove emphasis markers * and _ around words
  out = out.replace(/\*\*(.*?)\*\*/g, "$1");
  out = out.replace(/\*(.*?)\*/g, "$1");
  out = out.replace(/__(.*?)__/g, "$1");
  out = out.replace(/_(.*?)_/g, "$1");
  // Strip headings and bullets
  out = out.replace(/^\s{0,3}#{1,6}\s+/gm, "");
  out = out.replace(/^\s*[-*+]\s+/gm, "- ");
  out = out.replace(/^\s*\d+\.\s+/gm, "");
  // Collapse multiple spaces/newlines
  out = out.replace(/[\t ]{2,}/g, " ");
  out = out.replace(/\n{3,}/g, "\n\n");
  return out.trim();
}

function addBubble(text, role="bot") {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${role}`;
  
  const contentDiv = document.createElement("div");
  contentDiv.className = "message-content";
  contentDiv.textContent = text;
  
  // Add timestamp
  const timeDiv = document.createElement("div");
  timeDiv.className = "message-time";
  timeDiv.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  
  // Add language indicator for bot messages
  if (role === "bot") {
    const lang = languageSelect.value;
    const langIndicator = document.createElement("div");
    langIndicator.className = "lang-indicator";
    langIndicator.textContent = getLanguageFlag(lang);
    langIndicator.style.position = "absolute";
    langIndicator.style.right = "8px";
    langIndicator.style.bottom = "-18px";
    langIndicator.style.fontSize = "12px";
    langIndicator.style.opacity = "0.75";
    contentDiv.appendChild(langIndicator);
    
    // Add speaking indicator for bot messages
    const speakingIndicator = document.createElement("div");
    speakingIndicator.className = "speaking-indicator";
    speakingIndicator.textContent = "🔊";
    speakingIndicator.style.display = "none";
    speakingIndicator.style.position = "absolute";
    speakingIndicator.style.left = "-6px";
    speakingIndicator.style.top = "-6px";
    speakingIndicator.style.width = "18px";
    speakingIndicator.style.height = "18px";
    speakingIndicator.style.borderRadius = "50%";
    speakingIndicator.style.background = "rgba(41,182,246,.14)";
    speakingIndicator.style.display = "none";
    speakingIndicator.style.alignItems = "center";
    speakingIndicator.style.justifyContent = "center";
    contentDiv.appendChild(speakingIndicator);
    
    // Add replay button for manual TTS
    const replayButton = document.createElement("button");
    replayButton.className = "replay-button";
    replayButton.innerHTML = "🔊";
    replayButton.title = "Listen again";
    replayButton.onclick = () => speakFallback(text, messageDiv);
    contentDiv.appendChild(replayButton);
    
    // Store reference to speaking indicator for TTS control
    messageDiv.speakingIndicator = speakingIndicator;
  }
  
  messageDiv.appendChild(contentDiv);
  messageDiv.appendChild(timeDiv);
  
  chatPanel.appendChild(messageDiv);
  chatPanel.scrollTop = chatPanel.scrollHeight;
  
  return messageDiv; // Return the div for reference
}

// Function to get language flag/indicator
function getLanguageFlag(lang) {
  const flags = {
    "en": "🇺🇸",
    "ur": "🇵🇰", 
    "es": "🇪🇸",
    "ar": "🇸🇦"
  };
  return flags[lang] || "🌐";
}

async function sendMessage(message) {
  addBubble(message, "user");

  // Show typing indicator
  const typingIndicator = document.getElementById('typingIndicator');
  typingIndicator.style.display = 'flex';

  try {
    const payload = {
      message,
      language: languageSelect.value,
      age_level: ageSelect.value,
      tts: true
    };

    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    // Hide typing indicator
    typingIndicator.style.display = 'none';

    const rawResponse = data.text || "(no response)";
    const botResponse = markdownToPlain(rawResponse);
    const botBubble = addBubble(botResponse, "bot");

    // Try audio if provided
    if (data.audio_url) {
      playAudio(`${API_BASE}${data.audio_url}`);
    } else {
      // Fallback: Web Speech TTS - read the actual bot response
      // Small delay to ensure message is displayed first
      setTimeout(() => {
        speakFallback(botResponse, botBubble);
      }, 500);
    }
  } catch (e) {
    // Hide typing indicator on error
    typingIndicator.style.display = 'none';
    addBubble("Oops, something went wrong.", "bot");
    console.error(e);
  }
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = userInput.value.trim();
  if (!msg) return;
  userInput.value = "";
  sendMessage(msg);
});

// --- Audio playback for backend-provided URL ---
function playAudio(url) {
  const audio = new Audio(url);
  audio.play().catch(err => console.warn("Audio play failed", err));
}

// --- Language-specific placeholders ---
const languagePlaceholders = {
  "en": "Ask about climate change, renewable energy, or environmental conservation...",
  "ur": "موسمیاتی تبدیلی، قابل تجدید توانائی، یا ماحولیاتی تحفظ کے بارے میں پوچھیں...",
  "es": "Pregunta sobre cambio climático, energía renovable o conservación ambiental...",
  "ar": "اسأل عن تغير المناخ أو الطاقة المتجددة أو الحفاظ على البيئة..."
};

// Update placeholder when language changes
languageSelect.addEventListener("change", () => {
  userInput.placeholder = languagePlaceholders[languageSelect.value] || languagePlaceholders["en"];
  updateStatusDisplay();
});

// Set initial placeholder
userInput.placeholder = languagePlaceholders["en"];

// Function to update status display
function updateStatusDisplay() {
  const lang = languageSelect.value;
  const age = ageSelect.value;
  
  const languageNames = {
    "en": "English",
    "ur": "اردو", 
    "es": "Español",
    "ar": "العربية"
  };
  
  const ageNames = {
    "10": "Age 10",
    "12": "Age 12", 
    "adult": "Adult"
  };
  
  document.getElementById("currentLang").textContent = languageNames[lang] || "English";
  document.getElementById("currentAge").textContent = ageNames[age] || "Age 12";
}

// Initialize status display
updateStatusDisplay();

// Add welcome message based on language and age
let lastWelcomeBubble = null;
function addWelcomeMessage() {
  const welcomeMessages = {
    "en": {
      "10": "Hi there! 🌍 I'm your climate buddy! Ask me anything about our amazing planet!",
      "12": "Hello! 🌱 I'm here to teach you about climate and the environment. What would you like to learn?",
      "adult": "Welcome! 🌿 I'm your environmental education assistant. How can I help you today?"
    },
    "ur": {
      "10": "ہیلو! 🌍 میں آپ کا موسمیاتی دوست ہوں! ہمارے حیرت انگیز سیارے کے بارے میں کچھ بھی پوچھیں!",
      "12": "ہیلو! 🌱 میں یہاں آپ کو موسم اور ماحول کے بارے میں سکھانے کے لیے ہوں۔ آپ کیا سیکھنا چاہتے ہیں؟",
      "adult": "خوش آمدید! 🌿 میں آپ کا ماحولیاتی تعلیم کا معاون ہوں۔ آج میں آپ کی کیسے مدد کر سکتا ہوں؟"
    },
    "es": {
      "10": "¡Hola! 🌍 ¡Soy tu amigo del clima! ¡Pregúntame cualquier cosa sobre nuestro increíble planeta!",
      "12": "¡Hola! 🌱 Estoy aquí para enseñarte sobre el clima y el medio ambiente. ¿Qué te gustaría aprender?",
      "adult": "¡Bienvenido! 🌿 Soy tu asistente de educación ambiental. ¿Cómo puedo ayudarte hoy?"
    },
    "ar": {
      "10": "مرحباً! 🌍 أنا صديقك المناخي! اسألني أي شيء عن كوكبنا المذهل!",
      "12": "مرحباً! 🌱 أنا هنا لتعليمك عن المناخ والبيئة. ماذا تريد أن تتعلم؟",
      "adult": "أهلاً وسهلاً! 🌿 أنا مساعدك التعليمي البيئي. كيف يمكنني مساعدتك اليوم؟"
    }
  };
  
  const lang = languageSelect.value;
  const age = ageSelect.value;
  const message = welcomeMessages[lang]?.[age] || welcomeMessages["en"]["12"];
  // Remove previous welcome bubble to avoid piling up
  if (lastWelcomeBubble && lastWelcomeBubble.parentNode) {
    lastWelcomeBubble.parentNode.removeChild(lastWelcomeBubble);
  }
  lastWelcomeBubble = addBubble(message, "bot");
}

// Add welcome message when page loads
addWelcomeMessage();

// Update welcome message when language or age changes
languageSelect.addEventListener("change", addWelcomeMessage);
ageSelect.addEventListener("change", () => {
  addWelcomeMessage();
  updateStatusDisplay();
});

// --- Fallback TTS (browser Speech Synthesis) ---
function speakFallback(text, botBubble = null) {
  if (!("speechSynthesis" in window)) {
    console.warn("Speech synthesis not supported");
    return;
  }
  
  // Don't speak if text is empty or just placeholder
  if (!text || text === "(no response)" || text.trim() === "") {
    console.warn("No text to speak:", text);
    return;
  }
  
  console.log("Speaking text:", text);
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  // Show speaking indicator if bubble is provided
  if (botBubble && botBubble.speakingIndicator) {
    botBubble.speakingIndicator.style.display = "flex";
  }
  
  const u = new SpeechSynthesisUtterance(text);
  
  // Set language for TTS based on selected language
  const languageMap = {
    "en": "en-US",
    "ur": "ur-PK", 
    "es": "es-ES",
    "ar": "ar-SA"
  };
  u.lang = languageMap[languageSelect.value] || "en-US";
  
  // Add event handlers for debugging and visual feedback
  u.onstart = () => {
    console.log("TTS started speaking");
    if (botBubble && botBubble.speakingIndicator) {
      botBubble.speakingIndicator.style.display = "flex";
    }
  };
  
  u.onend = () => {
    console.log("TTS finished speaking");
    if (botBubble && botBubble.speakingIndicator) {
      botBubble.speakingIndicator.style.display = "none";
    }
  };
  
  u.onerror = (e) => {
    console.error("TTS error:", e);
    if (botBubble && botBubble.speakingIndicator) {
      botBubble.speakingIndicator.style.display = "none";
    }
  };
  
  window.speechSynthesis.speak(u);
}

// --- Mic recording -> /stt ---
let mediaRecorder, chunks = [], isRecording = false;

micBtn.addEventListener("click", async () => {
  if (!isRecording) {
    startRecording();
  } else {
    stopRecording();
  }
});

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const form = new FormData();
      form.append("language", languageSelect.value);
      form.append("audio", blob, "recording.webm");

      try {
        const res = await fetch(`${API_BASE}/stt`, { method: "POST", body: form });
        const data = await res.json();
        if (data.text) {
          userInput.value = data.text;
          sendMessage(data.text);
        }
      } catch (e) {
        console.error(e);
      }
    };
    mediaRecorder.start();
    isRecording = true;
    micBtn.textContent = "⏹";
    micBtn.classList.add("recording");
  } catch (err) {
    console.error("Mic failed", err);
    alert("Microphone not available.");
  }
}

function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    micBtn.textContent = "🎤";
    micBtn.classList.remove("recording");
  }
}

