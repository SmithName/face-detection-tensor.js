const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resolutionSelect = document.getElementById('resolution');
const flipButton = document.getElementById('flip-camera');

let model, currentStream;
let isFlipped = false;

async function setupCamera(resolution) {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    const [width, height] = resolution.split('x').map(Number);
    const constraints = {
        video: { width, height, facingMode: isFlipped ? 'user' : 'environment' },
        audio: false
    };

    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = currentStream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

async function loadModel() {
    return await blazeface.load();
}

async function detectFaces() {
    const predictions = await model.estimateFaces(video, false);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    predictions.forEach(prediction => {
        const start = prediction.topLeft;
        const end = prediction.bottomRight;
        const size = [end[0] - start[0], end[1] - start[1]];

        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(start[0], start[1], size[0], size[1]);
    });

    requestAnimationFrame(detectFaces);
}

function resizeCanvas() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
}

resolutionSelect.addEventListener('change', async () => {
    await setupCamera(resolutionSelect.value);
    resizeCanvas();
});

flipButton.addEventListener('click', async () => {
    isFlipped = !isFlipped;
    await setupCamera(resolutionSelect.value);
    resizeCanvas();
});

window.addEventListener('resize', resizeCanvas);

async function main() {
    await setupCamera(resolutionSelect.value);
    model = await loadModel();
    resizeCanvas();
    detectFaces();
}

main();
