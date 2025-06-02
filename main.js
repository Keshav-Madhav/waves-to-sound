import { resizeCanvas } from "./utils/resizeCanvas.js";
import { getDeltaTime } from "./utils/deltaTime.js";

// Define an array of canvas IDs
const waveCanvasIds = [
  "wave-1-canvas",
  "wave-2-canvas",
  "wave-3-canvas",
  "wave-4-canvas",
  "wave-5-canvas",
  "wave-6-canvas",
  "wave-7-canvas",
  "wave-8-canvas",
  "wave-9-canvas",
  "wave-10-canvas",
];
const waves = waveCanvasIds.map(id => {
  const canvas = document.getElementById(id);
  return {
    id,
    canvas,
    context: canvas.getContext("2d")
  };
});

const resizeAllWaves = () => {
  resizeCanvas({
    canvasArray: waves.map(w => w.canvas),
    height_percent: 12.5
  });
};

window.addEventListener('load', resizeAllWaves);
window.addEventListener('resize', resizeAllWaves);
