import { Wave } from './Wave.js';
import { resizeCanvas } from '../utils/resizeCanvas.js';

export class WaveManager {
  constructor(containerId) {
    this.waveCounter = 0;
    this.waves = [];
    this.container = document.getElementById(containerId);

    // Initialize with 6 waves
    for (let i = 0; i < 6; i++) this.addWave();

    // Set up event listeners
    window.addEventListener('load', () => this.resizeAllWaves());
    window.addEventListener('resize', () => this.resizeAllWaves());
    document.addEventListener('removeWave', (e) => this.removeWave(e.detail.id));
  }

  addWave() {
    this.waveCounter++;
    const wave = new Wave(this.waveCounter);
    this.waves.push(wave);

    const waveElement = wave.createElement();
    this.container.appendChild(waveElement);
    wave.initialize();

    this.resizeAllWaves();
    console.log(`Added wave ${this.waveCounter}`);
  }

  removeWave(id) {
    const index = this.waves.findIndex(w => w.id === id);
    if (index !== -1) {
      this.waves[index].destroy();
      this.waves.splice(index, 1);
      this.resizeAllWaves();
      console.log(`Removed wave ${id}`);
    }
  }

  resizeAllWaves() {
    const canvasArray = this.waves.map(w => w.visualizer?.canvas).filter(Boolean);
    if (canvasArray.length > 0) {
      resizeCanvas({
        canvasArray,
        height_percent: 12.5
      });
      
      this.waves.forEach(wave => {
        wave.visualizer?.draw();
      });
    }
  }
}