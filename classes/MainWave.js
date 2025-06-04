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

    this.visibleCycles = waveManager.visibleCycles || 5;
    this.baseFrequency = waveManager.baseFrequency || 10;
    this.padding = 20;
    this.minScalingFactor = 0.2; // Minimum scaling factor to ensure wave is still visible

    this.createMainWaveElement();
    this.setupEventListeners();
    this.resize();
  }

  getMaxDesiredAmplitude() {
    return (this.canvas.height / 2) - this.padding;
  }

  setupEventListeners() {
    ['waveToggled', 'wavePropertyChanged', 'waveAdded', 'waveRemoved'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        this.draw();
        this.updateFormulaDisplay();
      });
    });

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
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = 150;
    this.draw();
  }

  updateFormulaDisplay() {
    const formulaDisplay = document.getElementById('main-wave-formula');
    const activeWaves = this.waveManager.waves.filter(w => w.isActive);

    if (!formulaDisplay) return;

    if (activeWaves.length === 0) {
      formulaDisplay.textContent = 'No active waves';
      return;
    }

    const formula = activeWaves
      .map(wave => `${wave.amplitude}·${wave.waveType}(${wave.frequency.toFixed(0)}t)`)
      .join(' + ');
    formulaDisplay.textContent = formula;
  }

  draw() {
    const ctx = this.context;
    if (!ctx) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const midY = height / 2;
    const drawableHeight = height - 2 * this.padding;
    const maxDesiredAmplitude = this.getMaxDesiredAmplitude();

    ctx.clearRect(0, 0, width, height);

    // Draw axis
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();

    // Calculate time per cycle (in seconds)
    const timePerCycle = 1 / this.baseFrequency;
    const totalTime = this.visibleCycles * timePerCycle;

  // Add time markers at each cycle position (showing actual time)
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    
    for (let cycle = 0; cycle <= this.visibleCycles; cycle++) {
      const time = cycle * timePerCycle;
      const xPos = (cycle / this.visibleCycles) * width;
      
      // Format time display (show decimal places only if needed)
      let timeText;
      if (timePerCycle % 1 === 0) {
        timeText = `${time.toFixed(0)}s`;
      } else if (timePerCycle >= 0.1) {
        timeText = `${time.toFixed(1)}s`;
      } else {
        timeText = `${time.toFixed(2)}s`;
      }

      ctx.fillText(timeText, xPos-15, height - 1);
      ctx.beginPath();
      ctx.moveTo(xPos, 0);
      ctx.lineTo(xPos, height);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    const activeWaves = this.waveManager.waves.filter(w => w.isActive);
    const step = 0.5;
    const points = Math.floor(width / step);
    const duration = this.visibleCycles / this.baseFrequency;

    // Compute combined waveform
    const values = [];
    let globalMin = Infinity;
    let globalMax = -Infinity;

    for (let i = 0; i <= points; i++) {
      const t = (i / points) * duration;
      let sum = 0;
      activeWaves.forEach(w => {
        sum += w.getValueAtTime(t);
      });
      values.push(sum);
      if (sum < globalMin) globalMin = sum;
      if (sum > globalMax) globalMax = sum;
    }

    // Calculate the maximum amplitude of the combined wave
    const maxAmplitude = Math.max(Math.abs(globalMax), Math.abs(globalMin));
    
    // Dynamic scaling calculation
    let scalingFactor;
    if (maxAmplitude === 0) {
      scalingFactor = maxDesiredAmplitude; // Default when no amplitude
    } else {
      // Calculate scaling to fit the wave in the drawable area
      const requiredScaling = (drawableHeight / 2) / maxAmplitude;
      // Use the smaller of desired scaling or required scaling, but not less than minScalingFactor
      scalingFactor = Math.max(
        this.minScalingFactor,
        Math.min(maxDesiredAmplitude, requiredScaling)
      );
    }

    // Draw combined waveform
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1;

    for (let i = 0; i <= points; i++) {
      const x = i * step;
      let y = midY - values[i] * scalingFactor;

      // Clamp to visible range (just in case)
      if (y < this.padding) y = this.padding;
      if (y > height - this.padding) y = height - this.padding;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.stroke();

    // Display wave count
    ctx.fillStyle = this.color;
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`${activeWaves.length} active wave${activeWaves.length !== 1 ? 's' : ''}`, width - 10, 20);

    ctx.fillText(`Scale: ${scalingFactor.toFixed(1)}px/unit`, width - 10, 35);
  }
}