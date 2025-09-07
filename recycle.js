const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const analyzeBtn = document.getElementById('analyzeBtn');

uploadArea.addEventListener('click', () => imageInput.click());
uploadArea.addEventListener('dragover', e => { 
    e.preventDefault(); 
    uploadArea.classList.add('dragover'); 
});
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length) { 
        imageInput.files = files; 
        handleFileSelect(); 
    }
});
imageInput.addEventListener('change', handleFileSelect);

function handleFileSelect() {
    const file = imageInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        previewImage.src = e.target.result;
        uploadArea.style.display = 'none';
        previewContainer.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

analyzeBtn.addEventListener('click', async () => {
    const file = imageInput.files[0];
    if (!file) return alert("Please upload an image first!");

    document.getElementById('loading').style.display = 'flex';
    document.getElementById('grokResponse').style.display = 'none';

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const base64Image = e.target.result.split(',')[1];

            const response = await fetch("https://ecolearn-ai-dgewhwhbcxanepg6.centralindia-01.azurewebsites.net/recycle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image_base64: base64Image })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            document.getElementById('aiSuggestion').innerHTML = formatAISuggestion(data.ai_suggestion);
            document.getElementById('grokResponse').style.display = 'block';
        } catch (error) {
            console.error("Error:", error);
            document.getElementById('aiSuggestion').innerHTML = 'Sorry, there was an error processing your request.';
            document.getElementById('grokResponse').style.display = 'block';
        } finally {
            document.getElementById('loading').style.display = 'none';
        }
    };
    reader.readAsDataURL(file);
});

// --- Formatter for headings, bold, lists, and paragraphs ---
function formatAISuggestion(text) {
    if (!text) return "No suggestion available.";

    // Split into lines
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
    let formatted = "";
    let inList = false;

    lines.forEach(line => {
        line = line.trim();

        // Convert markdown bold **text** to HTML <strong>
        line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

        // Heading-like lines (ends with colon)
        if (line.endsWith(":")) {
            if (inList) { formatted += "</ul>"; inList = false; }
            formatted += `<h4 style="color:#2d6a4f; margin:15px 0 8px 0;">${line}</h4>`;
        }
        // Numbered or bullet list
        else if (/^(\d+\.|[-*•])\s+/.test(line)) {
            if (!inList) { formatted += "<ul style='margin-left:25px; margin-bottom:20px;'>"; inList = true; }
            formatted += `<li>${line.replace(/^(\d+\.|[-*•])\s+/, "")}</li>`;
        }
        // Regular paragraph
        else {
            if (inList) { formatted += "</ul>"; inList = false; }
            formatted += `<p style="margin-bottom:12px; line-height:1.6;">${line}</p>`;
        }
    });

    if (inList) formatted += "</ul>";
    return formatted;
}
