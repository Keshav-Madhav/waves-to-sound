export class WaveControls {
  constructor(wave, onRemoveCallback) {
    this.wave = wave;
    this.onRemoveCallback = onRemoveCallback;
    this.element = null;
  }

  createElement() {
    const element = document.createElement('div');
    element.className = 'wave-controls';
    element.innerHTML = this._generateHTML();
    this.element = element;
    this._setupEventListeners();
    return element;
  }

  _generateHTML() {
    return `
      <div class="wave-sliders-group">
        <div class="wave-control-group">
          <label>Freq</label>
          <input type="range" class="wave-slider frequency-slider" min="20" max="1000" value="${this.wave.frequency}" data-wave-id="${this.wave.id}">
          <input type="number" class="wave-input frequency-input" min="20" max="1000" value="${this.wave.frequency}" data-wave-id="${this.wave.id}">
          <span class="wave-unit">Hz</span>
        </div>
        <div class="wave-control-group">
          <label>Amp</label>
          <input type="range" class="wave-slider amplitude-slider" min="0" max="100" value="${this.wave.amplitude}" data-wave-id="${this.wave.id}">
          <input type="number" class="wave-input amplitude-input" min="0" max="100" value="${this.wave.amplitude}" data-wave-id="${this.wave.id}">
          <span class="wave-unit">%</span>
        </div>
      </div>
      <div class="wave-type-group">
        <label>Type</label>
        <select class="wave-select type-select" data-wave-id="${this.wave.id}">
          <option value="sine" ${this.wave.waveType === 'sine' ? 'selected' : ''}>Sine</option>
          <option value="square" ${this.wave.waveType === 'square' ? 'selected' : ''}>Square</option>
          <option value="triangle" ${this.wave.waveType === 'triangle' ? 'selected' : ''}>Triangle</option>
          <option value="sawtooth" ${this.wave.waveType === 'sawtooth' ? 'selected' : ''}>Sawtooth</option>
          <option value="reverse-sawtooth" ${this.wave.waveType === 'reverse-sawtooth' ? 'selected' : ''}>Reverse Sawtooth</option>
        </select>
      </div>
      <button class="remove-wave-btn" data-wave-id="${this.wave.id}" title="Remove Wave">✕</button>
    `;
  }

  _setupEventListeners() {
    const freqSlider = this.element.querySelector('.frequency-slider');
    const freqInput = this.element.querySelector('.frequency-input');
    const ampSlider = this.element.querySelector('.amplitude-slider');
    const ampInput = this.element.querySelector('.amplitude-input');
    const typeSelect = this.element.querySelector('.type-select');
    const removeBtn = this.element.querySelector('.remove-wave-btn');

    freqSlider?.addEventListener('input', e => {
      const value = parseFloat(e.target.value);
      freqInput.value = value;
      this.wave.setFrequency(value);
    });

    freqInput?.addEventListener('input', e => {
      let value = parseFloat(e.target.value);
      if (isNaN(value)) value = 20;
      value = Math.max(10, Math.min(200, value));
      freqSlider.value = value;
      e.target.value = value;
      this.wave.setFrequency(value);
    });

    ampSlider?.addEventListener('input', e => {
      const value = parseFloat(e.target.value);
      ampInput.value = value;
      this.wave.setAmplitude(value);
    });

    ampInput?.addEventListener('input', e => {
      let value = parseFloat(e.target.value);
      if (isNaN(value)) value = 0;
      value = Math.max(0, Math.min(100, value));
      ampSlider.value = value;
      e.target.value = value;
      this.wave.setAmplitude(value);
    });

    typeSelect?.addEventListener('change', e => {
      this.wave.setWaveType(e.target.value);
    });

    removeBtn?.addEventListener('click', () => {
      this.onRemoveCallback(this.wave.id);
    });
  }
}