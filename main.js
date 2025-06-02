import { WaveManager } from "./classes/WaveManager.js";

let isPlaying = false;

const manager = new WaveManager('wave-container');

document.getElementById('add-wave-btn').addEventListener('click', () => {
  manager.addWave();
});

document.getElementById('play-btn').addEventListener('click', () => {
  isPlaying = true;
  document.getElementById('play-btn').classList.add('active');
  document.getElementById('stop-btn').classList.remove('active');
  console.log('Play');
});

document.getElementById('stop-btn').addEventListener('click', () => {
  isPlaying = false;
  document.getElementById('play-btn').classList.remove('active');
  document.getElementById('stop-btn').classList.add('active');
  console.log('Stop');
});

document.getElementById('master-volume').addEventListener('input', (e) => {
  const volume = e.target.value;
  console.log(`Master volume set to ${volume}`);
});

// Global event to remove waves (delegated from Wave)
document.addEventListener('removeWave', (e) => {
  const waveId = e.detail;
  manager.removeWave(waveId);
});
