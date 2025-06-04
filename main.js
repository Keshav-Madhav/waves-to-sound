import { WaveManager } from "./classes/WaveManager.js";

const manager = new WaveManager('wave-container');

// Existing event listeners
document.getElementById('add-wave-btn').addEventListener('click', () => {
  manager.addWave();
});

document.getElementById('play-btn').addEventListener('click', () => {
  manager.play();
  document.getElementById('play-btn').classList.add('active');
  document.getElementById('stop-btn').classList.remove('active');
});

document.getElementById('stop-btn').addEventListener('click', () => {
  manager.stop();
  document.getElementById('play-btn').classList.remove('active');
  document.getElementById('stop-btn').classList.add('active');
});

// Updated master volume with display
document.getElementById('master-volume').addEventListener('input', (e) => {
  const volume = e.target.value;
  document.getElementById('volume-display').textContent = volume;
  console.log(`Master volume set to ${volume}`);
});

// New event listeners for enhanced controls
document.getElementById('active-all-btn').addEventListener('click', () => {
  manager.activeAllWaves();
});

document.getElementById('inactive-all-btn').addEventListener('click', () => {
  manager.inactiveAllWaves();
});

document.getElementById('visible-cycles').addEventListener('input', (e) => {
  const cycles = parseInt(e.target.value);
  document.getElementById('cycles-display').textContent = cycles;
  manager.setVisibleCyclesForAll(cycles);
});

document.getElementById('base-freq').addEventListener('input', (e) => {
  const base_freq = parseInt(e.target.value);
  document.getElementById('base-freq-display').textContent = base_freq;
  manager.setBaseFrequency(base_freq);
});

// Initialize displays on page load
window.addEventListener('load', () => {
  document.getElementById('volume-display').textContent = 
    document.getElementById('master-volume').value;
  document.getElementById('cycles-display').textContent = 
    document.getElementById('visible-cycles').value;
  document.getElementById('base-freq-display').textContent =
    document.getElementById('base-freq').value;
});

// Global event to remove waves (delegated from Wave)
document.addEventListener('removeWave', (e) => {
  const waveId = e.detail;
  manager.removeWave(waveId);
});