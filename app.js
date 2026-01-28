const video = document.getElementById('video');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsOverlay = document.getElementById('results-overlay');
const listEntries = document.getElementById('list-entries');

// Iniciar cámara trasera
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } 
        });
        video.srcObject = stream;
    } catch (err) {
        console.error("No se pudo acceder a la cámara:", err);
    }
}

// Lógica de detección (Simulada)
analyzeBtn.addEventListener('click', () => {
    analyzeBtn.innerText = "ESCANEANDO...";
    analyzeBtn.disabled = true;

    // Simulación de delay de procesamiento de imagen
    setTimeout(() => {
        const basePrice = Math.random() * (13000 - 12000) + 12000;
        const suggestions = [
            { id: 1, p: (basePrice - 1.2).toFixed(2), t: "OB Primario" },
            { id: 2, p: (basePrice - 3.5).toFixed(2), t: "Re-test Zona" },
            { id: 3, p: (basePrice - 5.1).toFixed(2), t: "OB Base EMA 200" }
        ];

        renderResults(suggestions);
        analyzeBtn.innerText = "ANALIZAR ENTRADAS";
        analyzeBtn.disabled = false;
    }, 1500);
});

function renderResults(data) {
    listEntries.innerHTML = "";
    resultsOverlay.style.display = "flex";
    
    data.forEach(item => {
        listEntries.innerHTML += `
            <div class="entry">
                <div style="font-size: 0.8rem; color: #888;">${item.t}</div>
                <div style="font-size: 1.4rem; font-weight: bold;">${item.p}</div>
                <div style="color: #00e676; font-size: 0.7rem;">✓ CONFIRMACIÓN ALCISTA</div>
            </div>
        `;
    });
}

startCamera();
