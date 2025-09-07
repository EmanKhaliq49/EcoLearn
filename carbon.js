document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("carbonForm");
    const tipsDiv = document.getElementById("tips");
    const totalDiv = document.getElementById("totalCO2");
    const resultsPanel = document.getElementById("resultsPanel");
    const carbonChart = document.getElementById("carbonChart");
    let chart;
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      // Show loading state
      tipsDiv.innerHTML = "🔄 Calculating your carbon footprint... 🌱";
      totalDiv.textContent = "";
      
      // Show results panel with animation
      resultsPanel.classList.add('show');
      
      const electricity = parseFloat(document.getElementById("electricity").value);
      const transport = parseFloat(document.getElementById("transport").value);
      const diet = document.getElementById("diet").value;
  
      // Simple carbon footprint calculation
      const dietScore = diet === "veg" ? 2 : diet === "mixed" ? 4 : 6;
      const transportScore = transport * 0.2; // kg CO₂ per km
      const electricityScore = electricity * 0.5; // kg CO₂ per kWh
      const totalCO2 = dietScore + transportScore + electricityScore;
  
      // Display total CO₂ with animation
      const totalCO2Text = `${totalCO2.toFixed(1)} kg`;
      totalDiv.innerHTML = `🎯 Your Carbon Footprint: ${totalCO2Text} CO₂/month`;
      
      // Add pulse animation to result
      totalDiv.style.animation = 'pulse 2s infinite';
      
      try {
        // Persist also legacy key for compatibility with older Share page reads
        localStorage.setItem('eco_co2_saved', totalCO2.toFixed(1));
      } catch {}

      // Persist to localStorage for Share card
      try {
        const key = 'ecolearn-impact';
        const existing = JSON.parse(localStorage.getItem(key) || '{}');
        const updated = { ...existing, co2: totalCO2Text };
        localStorage.setItem(key, JSON.stringify(updated));
      } catch {}
  
      // Show the actual chart
      carbonChart.style.display = 'block';
      
      // Chart.js bar with kid-friendly colors and animations
      if (chart) chart.destroy();
      const ctx = carbonChart.getContext("2d");
      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Diet', 'Transport', 'Electricity', 'Total CO₂'],
          datasets: [{
            label: 'kg CO₂',
            data: [dietScore, transportScore, electricityScore, totalCO2],
            backgroundColor: ['#4caf50','#ff9800','#2196f3','#9c27b0'],
            borderColor: ['#2e7d32','#f57c00','#1976d2','#7b1fa2'],
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
          }]
        },
        options: {
          responsive: true,
          animation: {
            duration: 1500,
            easing: 'easeOutBounce'
          },
          scales: { 
            y: { 
              beginAtZero: true,
              grid: {
                color: 'rgba(0,0,0,0.1)'
              }
            },
            x: {
              grid: {
                color: 'rgba(0,0,0,0.1)'
              }
            }
          },
          plugins: {
            legend: {
              labels: {
                font: {
                  family: 'Comic Sans MS',
                  size: 14
                }
              }
            }
          }
        }
      });
  
      try {
        // Fetch Grok tips
        const response = await fetch("https://ecolearn-ai-dgewhwhbcxanepg6.centralindia-01.azurewebsites.net/carbon-footprint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ electricity, transport, diet })
        });
        const data = await response.json();
  
        // Always show heading with emojis
        tipsDiv.innerHTML = "<h3>🌱 Eco-Friendly Tips to Reduce Your Impact:</h3>";
        tipsDiv.style.opacity = 0;
  
        if (data.tips && data.tips.length > 0) {
          const ul = document.createElement("ul");
          data.tips.slice(0, 3).forEach((tip) => {
            const li = document.createElement("li");
            li.textContent = tip;
            ul.appendChild(li);
          });
          tipsDiv.appendChild(ul);
          // Fade in tips with bounce effect
          requestAnimationFrame(() => {
            tipsDiv.style.transition = 'opacity 600ms ease-out';
            tipsDiv.style.opacity = 1;
          });
        } else {
          tipsDiv.innerHTML += "<p>No tips available at the moment. Try again!</p>";
        }
  
      } catch (error) {
        console.error("Error fetching carbon tips:", error);
        tipsDiv.innerHTML = "<h3>🌱 Eco-Friendly Tips to Reduce Your Impact:</h3><p>Something went wrong. Please try again later!</p>";
      }
    });
  });
  