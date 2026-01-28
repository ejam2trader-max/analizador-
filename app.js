const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const scanBtn = document.getElementById('scan-btn');
const calcBtn = document.getElementById('calc-btn');
const manualPriceInput = document.getElementById('manual-price');
const resultsArea = document.getElementById('results-area');

// 1. Iniciar Cámara (Optimizada para texto cercano)
navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment", focusMode: "continuous" }
}).then(stream => { video.srcObject = stream; })
  .catch(err => alert("Error de cámara: " + err));

// 2. Algoritmo de Procesamiento de Imagen (La parte "Experta")
function preprocessImage(ctx, width, height) {
    let imgData = ctx.getImageData(0, 0, width, height);
    let d = imgData.data;
    
    // Binarización: Convertir a Blanco y Negro puro para facilitar lectura
    for (let i = 0; i < d.length; i += 4) {
        let r = d[i], g = d[i+1], b = d[i+2];
        let v = 0.2126*r + 0.7152*g + 0.0722*b; // Luminosidad
        // Si es oscuro (fondo), hazlo blanco. Si es claro (texto), hazlo negro.
        // (Invertimos porque OCR lee mejor negro sobre blanco)
        let c = (v > 100) ? 0 : 255; 
        d[i] = d[i+1] = d[i+2] = c;
    }
    ctx.putImageData(imgData, 0, 0);
}

// 3. Escanear Precio
scanBtn.addEventListener('click', async () => {
    scanBtn.innerText = "⏳";
    scanBtn.disabled = true;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Dibujar frame
    ctx.drawImage(video, 0, 0);
    
    // Recortar solo el centro (donde está la caja verde) para evitar ruido
    const cropW = canvas.width * 0.6; 
    const cropH = canvas.height * 0.2;
    const cropX = (canvas.width - cropW) / 2;
    const cropY = (canvas.height - cropH) / 2;
    
    const cropData = ctx.getImageData(cropX, cropY, cropW, cropH);
    canvas.width = cropW;
    canvas.height = cropH;
    ctx.putImageData(cropData, 0, 0);

    // Aplicar filtro B/N
    preprocessImage(ctx, cropW, cropH);

    try {
        const { data: { text } } = await Tesseract.recognize(canvas, 'eng', {
            tessedit_char_whitelist: '0123456789.' // Solo permitimos números
        });

        // Limpiar resultado (quitar espacios, letras erróneas)
        let cleanText = text.replace(/[^0-9.]/g, ''); 
        // A veces lee "12400.50" como "12400..50", corregimos
        if ((cleanText.match(/\./g) || []).length > 1) {
            cleanText = cleanText.replace(/\.$/, ''); // Quitar punto final si sobra
        }

        const detectedPrice = parseFloat(cleanText);

        if (!isNaN(detectedPrice) && detectedPrice > 0) {
            manualPriceInput.value = detectedPrice;
            scanBtn.innerText = "✅";
        } else {
            alert("No se detectó nítidamente. Intenta acercar o escribe el precio manual.");
            scanBtn.innerText = "📷";
        }
    } catch (e) {
        console.error(e);
        scanBtn.innerText = "❌";
    }
    scanBtn.disabled = false;
});

// 4. Calcular Entradas (Lógica Trading BOOM)
calcBtn.addEventListener('click', () => {
    const price = parseFloat(manualPriceInput.value);
    
    if (!price) {
        alert("Primero escanea o escribe el precio actual.");
        return;
    }

    // Lógica BOOM (Buscamos compras abajo del precio actual)
    // Order Blocks típicos en M1 están a 2-5 puntos de distancia
    const strategies = [
        { name: "OB M1 (Agresivo)", offset: 1.5, type: "Scalping" },
        { name: "Breaker Block", offset: 3.2, type: "Intraday" },
        { name: "OB + EMA 200", offset: 6.5, type: "Swing" }
    ];

    resultsArea.innerHTML = "";
    
    strategies.forEach(strat => {
        const entryPrice = (price - strat.offset).toFixed(2);
        resultsArea.innerHTML += `
            <div class="trade-card">
                <div>
                    <div style="color:var(--green); font-size:0.8rem;">${strat.name}</div>
                    <div class="price-tag">${entryPrice}</div>
                </div>
                <div style="text-align:right;">
                    <div class="pip-dist">-${strat.offset} pts</div>
                    <div style="font-size:0.7rem; color:#888;">${strat.type}</div>
                </div>
            </div>
        `;
    });
});
