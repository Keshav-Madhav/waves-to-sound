import { WaveVisualizer } from './WaveVisualizer.js';

export class MainWave {
  constructor(waveManager, containerId) {
    this.waveManager = waveManager;
    this.container = document.getElementById(containerId);
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'main-wave-canvas';
    this.canvas.className = 'main-wave-canvas';
    this.context = this.canvas.getContext('2d');
    this.color = '#4a8fe7';

    this.visibleCycles = waveManager.visibleCycles || 10;
    this.baseFrequency = 20;
    
    this.createMainWaveElement();
    this.setupEventListeners();
    this.resize();
  }

  setupEventListeners() {
    // Listen for wave toggles
    document.addEventListener('waveToggled', () => {
      this.draw();
      this.updateFormulaDisplay();
    });

    // Listen for wave property changes
    document.addEventListener('wavePropertyChanged', () => {
      this.draw();
      this.updateFormulaDisplay();
    });

    // Listen for wave additions
    document.addEventListener('waveAdded', () => {
      this.draw();
      this.updateFormulaDisplay();
    });

    // Listen for wave removals
    document.addEventListener('waveRemoved', () => {
      this.draw();
      this.updateFormulaDisplay();
    });

    // Listen for window resize
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('load', () => this.resize());
  }

  createMainWaveElement() {
    const wrapper = document.createElement('div');
    wrapper.className = 'main-wave-wrapper';
    
    wrapper.innerHTML = `
      <div class="main-wave-header">Combined Waveform</div>
      <div class="wave-info">
        <div id="main-wave-formula" class="wave-formula"></div>
      </div>
    `;
    
    wrapper.appendChild(this.canvas);
    this.container.insertBefore(wrapper, this.container.firstChild);
  }

  resize() {
    const width = this.container.clientWidth;
    const height = 150; // Fixed height for main wave
    
    this.canvas.width = width;
    this.canvas.height = height;
    this.draw();
  }

  updateFormulaDisplay() {
    const activeWaves = this.waveManager.waves.filter(wave => wave.isActive);
    const formulaDisplay = document.getElementById('main-wave-formula');
    
    if (!formulaDisplay) return;
    
    if (activeWaves.length === 0) {
      formulaDisplay.textContent = 'No active waves';
      return;
    }
    
    // Create a simplified formula representation
    const formulas = activeWaves.map(wave => {
      return `${wave.amplitude}·${wave.waveType}(${wave.frequency.toFixed(0)}t)`;
    });
    
    formulaDisplay.textContent = formulas.join(' + ');
  }

  draw() {
    if (!this.context) return;
    
    const ctx = this.context;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const padding = 20; // Increased padding
    const drawableHeight = height - 2 * padding;
    const midY = height / 2;
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw axis line
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();
    
    // Add time markers
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    for (let cycle = 0; cycle <= this.visibleCycles; cycle++) {
      const xPos = (cycle / this.visibleCycles) * width;
      ctx.fillText(`${cycle.toFixed(1)}s`, xPos-15, height - 5);
      ctx.beginPath();
      ctx.moveTo(xPos, 0);
      ctx.lineTo(xPos, height);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    
    // Get all active waves
    const activeWaves = this.waveManager.waves.filter(wave => wave.isActive);
    
    // Calculate the maximum possible amplitude for scaling
    const maxPossibleAmplitude = activeWaves.reduce((sum, wave) => sum + Math.abs(wave.amplitude), 0);
    
    // Draw combined waveform
    const step = 0.5;
    const points = Math.floor(width / step);
    const duration = this.visibleCycles / this.baseFrequency; // Total time to visualize
    
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1;
    
    // Find the maximum actual value for auto-scaling
    let maxActualValue = 0;
    const values = [];
    
    // First pass: calculate all values and find maximum
    for (let i = 0; i <= points; i++) {
      const t = (i / points) * duration;
      let combinedValue = 0;
      
      activeWaves.forEach(wave => {
        combinedValue += wave.getValueAtTime(t);
      });
      
      values.push(combinedValue);
      maxActualValue = Math.max(maxActualValue, Math.abs(combinedValue));
    }
    
    // Adjust scaling based on actual values if they're smaller than max possible
    const actualScalingFactor = maxActualValue > 0
      ? (drawableHeight / 2) / maxActualValue
      : 1;
    
    // Second pass: draw the waveform
    for (let i = 0; i <= points; i++) {
      const x = i * step;
      const y = midY - values[i] * actualScalingFactor;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
    // Add info about the active waves
    ctx.fillStyle = this.color;
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(
      `${activeWaves.length} active waves`, 
      width - 10, 
      20
    );
  }
}