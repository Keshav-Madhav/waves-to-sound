import { WaveVisualizer } from './WaveVisualizer.js';
import { WaveAudio } from './WaveAudio.js';
import { WaveControls } from './WaveControls.js';
import { WaveFormulas } from './WaveFormulas.js';

export class Wave {
  constructor(id, visibleCycles = 10, manager = null, formulaExecutable = null, formulaDisplay = '') {
    this.id = id;
    this.frequency = id === 1 ? 432 : Math.floor(Math.random() * (4000 - 200 + 1) + 200)
    this.amplitude = id === 1 ? 100 : 100;
    this.phaseShift = 0;
    this.waveType = 'sine';
    this.formulaDisplay = formulaDisplay;
    this.formulaExecutable = formulaExecutable;
    this.isActive = true;
    this.visibleCycles = visibleCycles;
    this.baseFrequency = 10;
    this.manager = manager;

    this.visualizer = new WaveVisualizer(this);
    this.audio = new WaveAudio(this);
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
        <div class="wave-label">Wave ${this.id} <span class="wave-status" id="wave-${this.id}-status"></span></div>
        <div class="wave-formula" id="wave-${this.id}-formula">${this.formulaDisplay}</div>
      </div>
    `;
   
    wrapper.appendChild(this.controls.createElement());
    return wrapper;
  }

  initialize() {
    this.canvas = document.getElementById(`wave-${this.id}-canvas`);
    this.context = this.canvas?.getContext('2d');
   
    // Add click handler for toggle functionality
    if (this.canvas) {
      this.canvas.addEventListener('click', () => {
        this.toggleActive();
      });
      
      // Add cursor pointer to indicate clickability
      this.canvas.style.cursor = 'pointer';
    }
   
    // Initialize visualizer
    this.visualizer = new WaveVisualizer(this);
    this._updateFormulaDisplay();
    this._updateActiveStatus();
  }

  toggleActive() {
  this.isActive = !this.isActive;
  this._updateActiveStatus();
  
  // Handle audio immediately
  if (this.isActive) {
    if (this.manager?.isPlaying) {
      this.audio.play();
    }
  } else {
    this.audio.stop();
  }
  
  document.dispatchEvent(new CustomEvent('waveToggled', { 
    detail: { 
      id: this.id, 
      isActive: this.isActive 
    } 
  }));
}

  setActive(active) {
    this.isActive = active;
    this._updateActiveStatus();
    
    // Handle audio based on global play state
    if (this.isActive && this.manager?.isPlaying) {
      this.audio.play();
    } else {
      this.audio.stop();
    }
  }

  _updateActiveStatus() {
    const statusElement = document.getElementById(`wave-${this.id}-status`);
    const canvas = document.getElementById(`wave-${this.id}-canvas`);
    const wrapper = document.querySelector(`.wave-wrapper[data-wave-id="${this.id}"]`);
    
    if (statusElement) {
      statusElement.textContent = this.isActive ? '● ACTIVE' : '○ inactive';
      statusElement.className = `wave-status ${this.isActive ? 'active' : 'inactive'}`;
    }
    
    if (canvas) {
      canvas.className = `wave-canvas ${this.isActive ? 'active' : ''}`;
    }
    
    if (wrapper) {
      wrapper.className = `wave-wrapper ${this.isActive ? 'active' : ''}`;
    }
  }

  _updateFormulas() {
    const { formulaExecutable, formulaDisplay } = WaveFormulas.generate(
      this.waveType,
      this.amplitude,
      this.frequency,
      this.phaseShift
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
    this.audio.update(); // Add this line
    this._dispatchPropertyChange();
  }

  setAmplitude(value) {
    this.amplitude = value;
    this._updateFormulas();
    this.audio.update(); // Add this line
    this._dispatchPropertyChange();
  }

  setPhaseShift(value) {
    this.phaseShift = value;
    this._updateFormulas();
    this.audio.update(); // Add this line
    this._dispatchPropertyChange();
  }

  setWaveType(type) {
    this.waveType = type;
    this._updateFormulas();
    this.audio.update(); // Add this line
    this._dispatchPropertyChange();
  }

  _dispatchPropertyChange() {
    document.dispatchEvent(new CustomEvent('wavePropertyChanged', {
      detail: {
        id: this.id,
        wave: this.getWaveData()
      }
    }));
  }

  getValueAtTime(t) {
    return this.formulaExecutable?.(t) || 0;
  }

  setVisibleCycles(cycles) {
    this.visibleCycles = cycles;
    this._dispatchPropertyChange();
    if (this.visualizer) {
      this.visualizer.draw();
    }
  }

  setBaseFrequency(baseFrequency) {
    this.baseFrequency = baseFrequency;
    this._dispatchPropertyChange();
    if (this.visualizer) {
      this.visualizer.baseFrequency = baseFrequency;
      this.visualizer.draw();
    }
  }

  getWaveData() {
    return {
      id: this.id,
      frequency: this.frequency,
      amplitude: this.amplitude,
      phaseShift: this.phaseShift,
      type: this.waveType,
      isActive: this.isActive,
      visibleCycles: this.visibleCycles,
      formulaDisplay: this.formulaDisplay,
      formulaExecutable: this.formulaExecutable.toString()
    };
  }

  destroy() {
    this.audio.stop();
    this.audio.destroy();
    const el = document.querySelector(`.wave-wrapper[data-wave-id="${this.id}"]`);
    el?.remove();
  }
}