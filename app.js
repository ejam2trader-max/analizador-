const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snapBtn = document.getElementById('snap');
const resultsDiv = document.getElementById('results');
const priceText = document.getElementById('detected-price');
const entryList = document.getElementById('entry-list');

// Iniciar cámara con máxima resolución posible
navigator.mediaDevices.getUserMedia({ 
    video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } 
}).then(stream => { video.srcObject = stream; });

snapBtn.addEventListener('click', async () => {
    snapBtn.innerText = "LEYENDO GRÁFICO...";
    snapBtn.disabled = true;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // --- PRE-PROCESAMIENTO DE IMAGEN ---
    // Dibujamos la foto en el canvas
    ctx.drawImage(video, 0, 0);
    
    // Aplicamos filtro de escala de grises y alto contraste para mejorar el OCR
    ctx.filter = 'grayscale(1) contrast(2) brightness(1.2)';
    ctx.drawImage(canvas, 0, 0);

    try {
        // Ejecutar Tesseract enfocándonos solo en números y puntos
        const { data: { text } } = await Tesseract.recognize(canvas, 'eng', {
            tessedit_char_whitelist: '0123456789.' 
        });

        // Limpiamos el texto para encontrar el precio más probable
        const numbers = text.match(/\d{4,5}\.\d{2}/g); // Busca formato 12345.67

        if (numbers && numbers.length > 0) {
            // Tomamos el número detectado (usualmente el precio actual está en el eje derecho)
            const realPrice = parseFloat(numbers[0]);
            calcularEntradasReales(realPrice);
        } else {
            alert("No se detectó un precio válido. Enfoca la columna de precios a la derecha del gráfico.");
            snapBtn.innerText = "REINTENTAR";
            snapBtn.disabled = false;
        }
    } catch (e) {
        alert("Error en el escaneo: " + e.message);
        snapBtn.disabled = false;
    }
});

function calcularEntradasReales(price) {
    snapBtn.style.display = "none";
    resultsDiv.style.display = "block";
    priceText.innerText = `PRECIO BASE: ${price.toFixed(2)}`;

    // Lógica Matemática para Boom (Order Blocks por debajo del precio)
    // Usamos offsets pequeños (pips) típicos de temporalidad M1
    const entries = [
        { nombre: "OB Agresivo", val: price - 0.65 },
        { nombre: "OB Conservador", val: price - 1.40 },
        { nombre: "Zona EMA 200", val: price - 2.85 }
    ];

    entryList.innerHTML = "";
    entries.forEach(e => {
        entryList.innerHTML += `
            <div class="card" style="border-left: 5px solid #00c853; background: #1a1a1a; margin: 10px; padding: 15px; border-radius: 8px;">
                <div style="font-size: 0.8rem; color: #888;">${e.nombre}</div>
                <div style="font-size: 1.6rem; font-weight: bold; color: #fff;">${e.val.toFixed(2)}</div>
                <div style="font-size: 0.7rem; color: #00c853;">Puntos de distancia: ${(price - e.val).toFixed(2)}</div>
            </div>
        `;
    });
}
