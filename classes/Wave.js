import { WaveVisualizer } from './WaveVisualizer.js';
import { WaveAudio } from './WaveAudio.js';
import { WaveControls } from './WaveControls.js';
import { WaveFormulas } from './WaveFormulas.js';

export class Wave {
  constructor(id) {
    this.id = id;
    this.frequency = 100;
    this.amplitude = 50;
    this.waveType = 'sine';
    this.formulaDisplay = '';
    this.formulaExecutable = null;
    
    this.visualizer = new WaveVisualizer(this);
    this.audio = new WaveAudio(this); // Placeholder for future audio
    this.controls = new WaveControls(this, (id) => {
      document.dispatchEvent(new CustomEvent('removeWave', { detail: { id } }));
    });
    
    this._updateFormulas();
  }

  createElement() {
    const wrapper = document.createElement('div');
    wrapper.className = 'wave-wrapper';
    wrapper.setAttribute('data-wave-id', this.id);

    wrapper.innerHTML = `
      <canvas id="wave-${this.id}-canvas" class="wave-canvas"></canvas>
      <div class="wave-info">
        <div class="wave-label">Wave ${this.id}</div>
        <div class="wave-formula" id="wave-${this.id}-formula">${this.formulaDisplay}</div>
      </div>
    `;
    
    wrapper.appendChild(this.controls.createElement());
    return wrapper;
  }

  initialize() {
    // Maintain backward compatibility with old resize method
    this.canvas = document.getElementById(`wave-${this.id}-canvas`);
    this.context = this.canvas?.getContext('2d');
    
    // Initialize visualizer
    this.visualizer = new WaveVisualizer(this);
    this._updateFormulaDisplay();
  }

  _updateFormulas() {
    const { formulaExecutable, formulaDisplay } = WaveFormulas.generate(
      this.waveType,
      this.amplitude,
      this.frequency
    );
    
    this.formulaExecutable = formulaExecutable;
    this.formulaDisplay = formulaDisplay;
    this._updateFormulaDisplay();
    
    if (this.visualizer) {
      this.visualizer.draw();
    }
  }

  _updateFormulaDisplay() {
    const formulaDisplay = document.getElementById(`wave-${this.id}-formula`);
    if (formulaDisplay) {
      formulaDisplay.textContent = this.formulaDisplay;
    }
  }

  setFrequency(value) {
    this.frequency = value;
    this._updateFormulas();
  }

  setAmplitude(value) {
    this.amplitude = value;
    this._updateFormulas();
  }

  setWaveType(type) {
    this.waveType = type;
    this._updateFormulas();
  }

  getValueAtTime(t) {
    return this.formulaExecutable?.(t) || 0;
  }

  getWaveData() {
    return {
      id: this.id,
      frequency: this.frequency,
      amplitude: this.amplitude,
      type: this.waveType,
      formulaDisplay: this.formulaDisplay,
      formulaExecutable: this.formulaExecutable.toString()
    };
  }

  destroy() {
    const el = document.querySelector(`.wave-wrapper[data-wave-id="${this.id}"]`);
    el?.remove();
  }
}