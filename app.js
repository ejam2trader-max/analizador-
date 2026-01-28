const video = document.getElementById('video');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsOverlay = document.getElementById('results-overlay');
const listEntries = document.getElementById('list-entries');

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } 
        });
        video.srcObject = stream;
    } catch (err) {
        alert("Error de cámara: Asegúrate de usar HTTPS o localhost");
    }
}

// Simulación de análisis de proximidad
analyzeBtn.addEventListener('click', () => {
    analyzeBtn.innerText = "DETECTANDO PRECIO...";
    analyzeBtn.disabled = true;

    setTimeout(() => {
        // Simulamos el precio actual del mercado (ej. Boom 1000)
        const currentPrice = 12450.75; 
        
        // Generamos 3 entradas muy cercanas (Order Blocks inmediatos)
        // Boom se opera en Compras, por lo que buscamos el OB justo debajo del precio
        const suggestions = [
            { 
                tipo: "OB Inmediato", 
                precio: (currentPrice - 0.85).toFixed(2), 
                distancia: "Muy Cerca" 
            },
            { 
                tipo: "OB Decisional", 
                precio: (currentPrice - 1.60).toFixed(2), 
                distancia: "Cercano" 
            },
            { 
                tipo: "OB Extremo (EMA 200)", 
                precio: (currentPrice - 2.95).toFixed(2), 
                distancia: "Seguro" 
            }
        ];

        renderResults(currentPrice, suggestions);
        analyzeBtn.innerText = "ANALIZAR ENTRADAS";
        analyzeBtn.disabled = false;
    }, 1800);
});

function renderResults(current, data) {
    listEntries.innerHTML = `
        <div style="margin-bottom: 15px; border-bottom: 1px solid #444; padding-bottom: 10px;">
            <small style="color: #888;">PRECIO ACTUAL DETECTADO</small>
            <div style="font-size: 1.5rem; color: #fff; font-weight: bold;">${current}</div>
        </div>
    `;
    
    resultsOverlay.style.display = "flex";
    
    data.forEach(item => {
        listEntries.innerHTML += `
            <div class="entry">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.8rem; color: #00e676;">${item.tipo}</span>
                    <span style="font-size: 0.7rem; background: #333; padding: 2px 6px; border-radius: 4px;">${item.distancia}</span>
                </div>
                <div style="font-size: 1.6rem; font-weight: bold; margin: 5px 0;">${item.precio}</div>
                <div style="color: #888; font-size: 0.7rem;">Estrategia: Esperar reacción en zona</div>
            </div>
        `;
    });
}

startCamera();
