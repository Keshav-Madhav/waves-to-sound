import { resizeCanvas } from "./utils/resizeCanvas.js";
import { getDeltaTime } from "./utils/deltaTime.js";

// Wave management
let waveCounter = 0;
let waves = [];
let isPlaying = false;

// Initialize with 6 waves
for (let i = 0; i < 6; i++) {
  addWave();
}

// Resize all waves using the utility function
function resizeAllWaves() {
  const canvasArray = waves.map(w => w.canvas).filter(canvas => canvas);
  if (canvasArray.length > 0) {
    resizeCanvas({
      canvasArray: canvasArray,
      height_percent: 12.5
    });
  }
}

function createWaveElement(id) {
  const waveWrapper = document.createElement('div');
  waveWrapper.className = 'wave-wrapper';
  waveWrapper.setAttribute('data-wave-id', id);
  
  waveWrapper.innerHTML = `
    <canvas id="wave-${id}-canvas" class="wave-canvas"></canvas>
    <div class="wave-label">Wave ${id}</div>
    <div class="wave-controls">
      <div class="wave-control-group">
        <label>Freq</label>
        <input type="range" class="wave-slider frequency-slider" min="20" max="2000" value="440" data-wave-id="${id}">
        <input type="number" class="wave-input frequency-input" min="20" max="2000" value="440" data-wave-id="${id}">
      </div>
      <div class="wave-control-group">
        <label>Amp</label>
        <input type="range" class="wave-slider amplitude-slider" min="0" max="100" value="50" data-wave-id="${id}">
        <input type="number" class="wave-input amplitude-input" min="0" max="100" value="50" data-wave-id="${id}">
      </div>
      <button class="remove-wave-btn" data-wave-id="${id}">Remove</button>
    </div>
  `;
  
  return waveWrapper;
}

function addWave() {
  waveCounter++;
  const waveContainer = document.getElementById('wave-container');
  const waveElement = createWaveElement(waveCounter);
  
  waveContainer.appendChild(waveElement);
  
  const canvas = document.getElementById(`wave-${waveCounter}-canvas`);
  const context = canvas.getContext('2d');
  
  const waveData = {
    id: waveCounter,
    canvas: canvas,
    context: context,
    frequency: 440,
    amplitude: 50
  };
  
  waves.push(waveData);
  
  // Resize all canvases
  resizeAllWaves();
  
  // Add event listeners for this wave's controls
  setupWaveControls(waveCounter);
  
  console.log(`Added wave ${waveCounter}`);
}

function removeWave(waveId) {
  // Find and remove from waves array
  const waveIndex = waves.findIndex(wave => wave.id === waveId);
  if (waveIndex !== -1) {
    waves.splice(waveIndex, 1);
  }
  
  // Remove from DOM
  const waveElement = document.querySelector(`[data-wave-id="${waveId}"]`);
  if (waveElement) {
    waveElement.remove();
  }
  
  console.log(`Removed wave ${waveId}`);
}

function setupWaveControls(waveId) {
  // Frequency slider and input
  const freqSlider = document.querySelector(`.frequency-slider[data-wave-id="${waveId}"]`);
  const freqInput = document.querySelector(`.frequency-input[data-wave-id="${waveId}"]`);
  
  freqSlider.addEventListener('input', (e) => {
    const value = e.target.value;
    freqInput.value = value;
    updateWaveProperty(waveId, 'frequency', parseFloat(value));
  });
  
  freqInput.addEventListener('input', (e) => {
    const value = Math.max(20, Math.min(2000, parseFloat(e.target.value) || 20));
    freqSlider.value = value;
    e.target.value = value;
    updateWaveProperty(waveId, 'frequency', value);
  });
  
  // Amplitude slider and input
  const ampSlider = document.querySelector(`.amplitude-slider[data-wave-id="${waveId}"]`);
  const ampInput = document.querySelector(`.amplitude-input[data-wave-id="${waveId}"]`);
  
  ampSlider.addEventListener('input', (e) => {
    const value = e.target.value;
    ampInput.value = value;
    updateWaveProperty(waveId, 'amplitude', parseFloat(value));
  });
  
  ampInput.addEventListener('input', (e) => {
    const value = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
    ampSlider.value = value;
    e.target.value = value;
    updateWaveProperty(waveId, 'amplitude', value);
  });
  
  const removeBtn = document.querySelector(`.remove-wave-btn[data-wave-id="${waveId}"]`);
  removeBtn.addEventListener('click', () => {
    removeWave(waveId);
  });
}

function updateWaveProperty(waveId, property, value) {
  const wave = waves.find(w => w.id === waveId);
  if (wave) {
    wave[property] = value;
    console.log(`Updated wave ${waveId} ${property} to ${value}`);
  }
}

// Main control event listeners
document.getElementById('add-wave-btn').addEventListener('click', addWave);

document.getElementById('play-btn').addEventListener('click', () => {
  isPlaying = true;
  document.getElementById('play-btn').classList.add('active');
  document.getElementById('stop-btn').classList.remove('active');
  console.log('Play button clicked');
});

document.getElementById('stop-btn').addEventListener('click', () => {
  isPlaying = false;
  document.getElementById('play-btn').classList.remove('active');
  document.getElementById('stop-btn').classList.add('active');
  console.log('Stop button clicked');
});

document.getElementById('master-volume').addEventListener('input', (e) => {
  const volume = e.target.value;
  console.log(`Master volume set to ${volume}`);
});

// Window resize handler
window.addEventListener('load', resizeAllWaves);
window.addEventListener('resize', resizeAllWaves);

// Event delegation for dynamically created wave controls
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-wave-btn')) {
    const waveId = parseInt(e.target.getAttribute('data-wave-id'));
    removeWave(waveId);
  }
});