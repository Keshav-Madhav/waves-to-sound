import { Wave } from './Wave.js';
import { resizeCanvas } from '../utils/resizeCanvas.js';
import { MainWave } from './MainWave.js';

export class WaveManager {
  constructor(containerId) {
    this.waveCounter = 0;
    this.waves = [];
    this.container = document.getElementById(containerId);
    this.visibleCycles = 5;
    this.baseFrequency = 10;
    this.isPlaying = false;
    this.startTime = 0;
    this.lastDrawTime = 0;
    this.animationFrameId = null;

    // Initialize main wave
    this.mainWave = new MainWave(this, containerId);

    // Initialize with 1 wave
    for (let i = 0; i < 1; i++) this.addWave();

    // Set up event listeners
    window.addEventListener('load', () => this.resizeAllWaves());
    window.addEventListener('resize', () => this.resizeAllWaves());
    document.addEventListener('removeWave', (e) => this.removeWave(e.detail.id));
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
  
  play() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.startTime = this.waves[0]?.audio.audioContext?.currentTime || 
                     (new AudioContext()).currentTime;
    
    // Start all waves at the same time
    this.waves.forEach(wave => {
      if (wave.isActive) {
        wave.audio.play(this.startTime);
      }
    });
    
    this.mainWave.draw();
    this.startVisualizationLoop();
  }

  stop() {
    if (!this.isPlaying) return;
    
    this.isPlaying = false;
    this.waves.forEach(wave => {
      wave.audio.stop();
    });
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this.mainWave.draw();
  }

  startVisualizationLoop() {
    if (!this.isPlaying) return;
    
    const draw = () => {
      if (!this.isPlaying) return;
      
      const currentTime = this.waves[0]?.audio.audioContext?.currentTime || 
                         (new AudioContext()).currentTime;
      const elapsed = currentTime - this.startTime;
      
      // Update all visualizers
      this.waves.forEach(wave => {
        if (wave.visualizer) {
          wave.visualizer.draw(elapsed);
        }
      });
      
      if (this.mainWave) {
        this.mainWave.draw(elapsed);
      }
      
      this.animationFrameId = requestAnimationFrame(draw);
    };
    
    this.animationFrameId = requestAnimationFrame(draw);
  }

  // Update the activeAllWaves and inactiveAllWaves methods:
  activeAllWaves() {
    this.waves.forEach(wave => {
      wave.isActive = true;
      wave._updateActiveStatus();
      if (this.isPlaying) {
        wave.audio.play();
      }
    });
    this.mainWave.draw();
  }

  inactiveAllWaves() {
    this.waves.forEach(wave => {
      wave.isActive = false;
      wave._updateActiveStatus();
      wave.audio.stop();
    });
    this.mainWave.draw();
  }

  addWave() {
    this.waveCounter++;
    const wave = new Wave(this.waveCounter, this.visibleCycles, this);
    this.waves.push(wave);

    const waveElement = wave.createElement();
    this.container.appendChild(waveElement);
    wave.initialize();

    if (this.isPlaying && wave.isActive) {
      wave.audio.play();
    }

    this.resizeAllWaves();
    console.log(`Added wave ${this.waveCounter}`);
    
    document.dispatchEvent(new CustomEvent('waveAdded', { 
      detail: { id: this.waveCounter } 
    }));
  }

  removeWave(id) {
    const index = this.waves.findIndex(w => w.id === id);
    if (index !== -1) {
      this.waves[index].destroy();
      this.waves.splice(index, 1);
      this.resizeAllWaves();
      console.log(`Removed wave ${id}`);
      
      // Dispatch event when a wave is removed
      document.dispatchEvent(new CustomEvent('waveRemoved', { 
        detail: { id } 
      }));
    }
  }

  setVisibleCyclesForAll(cycles) {
    this.visibleCycles = cycles;
    this.waves.forEach(wave => {
      wave.setVisibleCycles(cycles);
    });
    this.mainWave.visibleCycles = cycles;
    this.mainWave.draw();
  }

  setBaseFrequency(baseFrequency) {
    this.baseFrequency = baseFrequency;
    this.waves.forEach(wave => {
      wave.setBaseFrequency(baseFrequency);
    });
    this.mainWave.baseFrequency = baseFrequency;
    this.mainWave.draw();
  }
}