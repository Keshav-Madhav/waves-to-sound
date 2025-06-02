import { resizeCanvas } from "../utils/resizeCanvas.js";
import { Wave } from "./Wave.js";

export class WaveManager {
  constructor(containerId) {
    this.waveCounter = 0;
    this.waves = [];
    this.container = document.getElementById(containerId);

    for (let i = 0; i < 6; i++) this.addWave();

    window.addEventListener('load', () => this.resizeAllWaves());
    window.addEventListener('resize', () => this.resizeAllWaves());
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
    const canvasArray = this.waves.map(w => w.canvas).filter(Boolean);
    if (canvasArray.length > 0) {
      resizeCanvas({
        canvasArray,
        height_percent: 12.5
      });
    }
  }
}
