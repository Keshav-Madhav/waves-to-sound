export class Wave {
  constructor(id) {
    this.id = id;
    this.frequency = 440; // Default frequency in Hz
    this.amplitude = 50;  // Default amplitude (0-100)
    this.waveType = 'sine'; // Default wave type
    this.formulaDisplay = '';    // Human-readable formula string
    this.formulaExecutable = ''; // Executable JavaScript formula
    this.canvas = null;
    this.context = null;

    // Initialize the formulas when the object is created
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
      <div class="wave-controls">
        <div class="wave-sliders-group">
          <div class="wave-control-group">
            <label>Freq</label>
            <input type="range" class="wave-slider frequency-slider" min="20" max="2000" value="${this.frequency}" data-wave-id="${this.id}">
            <input type="number" class="wave-input frequency-input" min="20" max="2000" value="${this.frequency}" data-wave-id="${this.id}">
            <span class="wave-unit">Hz</span>
          </div>
          <div class="wave-control-group">
            <label>Amp</label>
            <input type="range" class="wave-slider amplitude-slider" min="0" max="100" value="${this.amplitude}" data-wave-id="${this.id}">
            <input type="number" class="wave-input amplitude-input" min="0" max="100" value="${this.amplitude}" data-wave-id="${this.id}">
            <span class="wave-unit">%</span>
          </div>
        </div>
        <div class="wave-type-group">
          <label>Type</label>
          <select class="wave-select type-select" data-wave-id="${this.id}">
            <option value="sine" ${this.waveType === 'sine' ? 'selected' : ''}>Sine</option>
            <option value="square" ${this.waveType === 'square' ? 'selected' : ''}>Square</option>
            <option value="triangle" ${this.waveType === 'triangle' ? 'selected' : ''}>Triangle</option>
            <option value="sawtooth" ${this.waveType === 'sawtooth' ? 'selected' : ''}>Sawtooth</option>
            <option value="reverse-sawtooth" ${this.waveType === 'reverse-sawtooth' ? 'selected' : ''}>Reverse Sawtooth</option>
          </select>
        </div>
        <button class="remove-wave-btn" data-wave-id="${this.id}" title="Remove Wave">✕</button>
      </div>
    `;
    return wrapper;
  }

  initialize() {
    this.canvas = document.getElementById(`wave-${this.id}-canvas`);
    if (this.canvas) {
        this.context = this.canvas.getContext('2d');
    } else {
        console.error(`Canvas element for wave ${this.id} not found.`);
    }
    this.setupControls();
    this._updateFormulaDisplay(); // Update the formula display in the UI
    console.log(`Wave ${this.id} initialized. Formula: ${this.formulaDisplay}`);
  }

  setupControls() {
    const waveElement = document.querySelector(`[data-wave-id="${this.id}"]`);
    if (!waveElement) {
        console.error(`Wave element for wave ${this.id} not found during control setup.`);
        return;
    }

    const freqSlider = waveElement.querySelector(`.frequency-slider`);
    const freqInput = waveElement.querySelector(`.frequency-input`);
    const ampSlider = waveElement.querySelector(`.amplitude-slider`);
    const ampInput = waveElement.querySelector(`.amplitude-input`);
    const typeSelect = waveElement.querySelector(`.type-select`);
    const removeBtn = waveElement.querySelector(`.remove-wave-btn`);

    if (freqSlider && freqInput) {
        freqSlider.addEventListener('input', e => {
          const value = parseFloat(e.target.value);
          freqInput.value = value;
          this.setFrequency(value);
        });

        freqInput.addEventListener('input', e => {
          let value = parseFloat(e.target.value);
          if (isNaN(value)) value = 20; // Default if NaN
          value = Math.max(20, Math.min(2000, value));
          freqSlider.value = value;
          e.target.value = value; // Ensure input reflects sanitized value
          this.setFrequency(value);
        });
    } else {
        console.warn(`Frequency controls for wave ${this.id} not found.`);
    }

    if (ampSlider && ampInput) {
        ampSlider.addEventListener('input', e => {
          const value = parseFloat(e.target.value);
          ampInput.value = value;
          this.setAmplitude(value);
        });

        ampInput.addEventListener('input', e => {
          let value = parseFloat(e.target.value);
          if (isNaN(value)) value = 0; // Default if NaN
          value = Math.max(0, Math.min(100, value));
          ampSlider.value = value;
          e.target.value = value; // Ensure input reflects sanitized value
          this.setAmplitude(value);
        });
    } else {
        console.warn(`Amplitude controls for wave ${this.id} not found.`);
    }

    if (typeSelect) {
        typeSelect.addEventListener('change', (e) => {
          const selectedType = e.target.value;
          this.setWaveType(selectedType);
        });
    } else {
        console.warn(`Type select for wave ${this.id} not found.`);
    }

    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          document.dispatchEvent(new CustomEvent('removeWave', { detail: { id: this.id } }));
        });
    } else {
        console.warn(`Remove button for wave ${this.id} not found.`);
    }
  }

  _updateFormulas() {
    const A = this.amplitude / 100; // Convert to 0-1 range
    const f = this.frequency;
    const pi = Math.PI;
    const sign = Math.sign;
    const asin = Math.asin;
    const sin = Math.sin;
    const floor = Math.floor;

    // Create executable formulas
    switch (this.waveType) {
      case 'sine':
        this.formulaExecutable = (t) => A * sin(2 * pi * f * t);
        break;
      case 'square':
        this.formulaExecutable = (t) => A * sign(sin(2 * pi * f * t));
        break;
      case 'triangle':
        this.formulaExecutable = (t) => A * (2/pi) * asin(sin(2 * pi * f * t));
        break;
      case 'sawtooth':
        this.formulaExecutable = (t) => A * 2 * (f * t - floor(0.5 + f * t));
        break;
      case 'reverse-sawtooth':
        this.formulaExecutable = (t) => A * 2 * (0.5 - (f * t - floor(f * t)));
        break;
      default:
        this.formulaExecutable = (t) => 0;
    }

    // Create display-friendly formulas
    const A_display = this.amplitude;
    const f_display = this.frequency;
    const pi_display = 'π';
    
    switch (this.waveType) {
      case 'sine':
        this.formulaDisplay = `${A_display}% × sin(2${pi_display}×${f_display}t)`;
        break;
      case 'square':
        this.formulaDisplay = `${A_display}% × sign(sin(2${pi_display}×${f_display}t)`;
        break;
      case 'triangle':
        this.formulaDisplay = `${A_display}% × (2/${pi_display}) × asin(sin(2${pi_display}×${f_display}t)`;
        break;
      case 'sawtooth':
        this.formulaDisplay = `${A_display}% × 2×(${f_display}t − floor(½ + ${f_display}t))`;
        break;
      case 'reverse-sawtooth':
        this.formulaDisplay = `${A_display}% × 2×(½ − (${f_display}t − floor(${f_display}t)))`;
        break;
      default:
        this.formulaDisplay = 'Unknown wave type';
    }

    this._updateFormulaDisplay();
    console.log(`Wave ${this.id} formulas updated. Display: ${this.formulaDisplay}`);
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
    console.log(`Wave ${this.id} frequency set to ${this.frequency} Hz`);
  }

  setAmplitude(value) {
    this.amplitude = value;
    this._updateFormulas();
    console.log(`Wave ${this.id} amplitude set to ${this.amplitude}%`);
  }

  setWaveType(type) {
    this.waveType = type;
    this._updateFormulas();
    console.log(`Wave ${this.id} type set to ${this.waveType}`);
  }

  getValueAtTime(t) {
    // Execute the formula to get the wave value at time t
    return this.formulaExecutable(t);
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
    if (el) {
      el.remove();
      console.log(`Wave ${this.id} element removed from DOM.`);
    } else {
      console.warn(`Could not find element for wave ${this.id} to destroy.`);
    }
  }
}