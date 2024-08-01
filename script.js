const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
    });
    video.srcObject = stream;
    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

async function loadModel() {
    return await blazeface.load();
}

async function detectFaces(model) {
    const predictions = await model.estimateFaces(video, false);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    predictions.forEach(prediction => {
        const start = prediction.topLeft;
        const end = prediction.bottomRight;
        const size = [end[0] - start[0], end[1] - start[1]];

        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(start[0], start[1], size[0], size[1]);
    });

    requestAnimationFrame(() => detectFaces(model));
}

async function main() {
    await setupCamera();
    const model = await loadModel();
    detectFaces(model);
}

main();
