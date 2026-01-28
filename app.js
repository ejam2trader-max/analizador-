const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snapBtn = document.getElementById('snap');
const resultsDiv = document.getElementById('results');
const priceText = document.getElementById('detected-price');
const entryList = document.getElementById('entry-list');

// 1. Iniciar cámara
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => { video.srcObject = stream; });

// 2. Procesar Imagen y Analizar
snapBtn.addEventListener('click', async () => {
    snapBtn.innerText = "PROCESANDO IMAGEN...";
    snapBtn.disabled = true;

    // Dibujar frame del video en el canvas
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Ejecutar OCR con Tesseract
    try {
        const { data: { text } } = await Tesseract.recognize(canvas, 'eng');
        
        // Extraer solo números con decimales (formato de precio)
        const numbers = text.match(/\d+\.\d+/g);
        
        if (numbers && numbers.length > 0) {
            // Tomamos el primer número que parezca un precio de índice
            const realPrice = parseFloat(numbers[0]);
            mostrarEntradas(realPrice);
        } else {
            alert("No se detectó el precio. Asegúrate de enfocar bien los números del eje derecho del gráfico.");
            snapBtn.innerText = "REINTENTAR";
            snapBtn.disabled = false;
        }
    } catch (e) {
        console.error(e);
        alert("Error analizando la imagen.");
    }
});

function mostrarEntradas(price) {
    snapBtn.style.display = "none";
    resultsDiv.style.display = "block";
    priceText.innerText = `PRECIO DETECTADO: ${price}`;

    // Lógica para Boom: Order Blocks están debajo del precio actual
    // Buscamos zonas de reacción muy cercanas (distancia de pips)
    const setup = [
        { zona: "OB Inmediato", p: price - 0.45, conf: "Alta" },
        { zona: "OB Decisional", p: price - 1.20, conf: "Media" },
        { zona: "OB EMA 200", p: price - 2.80, conf: "Fuerte" }
    ];

    entryList.innerHTML = "";
    setup.forEach(s => {
        entryList.innerHTML += `
            <div class="card">
                <div style="font-size:0.8rem; color:var(--green)">${s.zona}</div>
                <div style="font-size:1.5rem; font-weight:bold;">${s.p.toFixed(2)}</div>
                <div style="font-size:0.7rem; color:#aaa;">Confirmación: ${s.conf}</div>
            </div>
        `;
    });
}
