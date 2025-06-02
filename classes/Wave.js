export class Wave {
  constructor(id) {
    this.id = id;
    this.frequency = 440;
    this.amplitude = 50;
    this.canvas = null;
    this.context = null;
  }

  createElement() {
    const wrapper = document.createElement('div');
    wrapper.className = 'wave-wrapper';
    wrapper.setAttribute('data-wave-id', this.id);

    wrapper.innerHTML = `
      <canvas id="wave-${this.id}-canvas" class="wave-canvas"></canvas>
      <div class="wave-label">Wave ${this.id}</div>
      <div class="wave-controls">
        <div class="wave-control-group">
          <label>Freq</label>
          <input type="range" class="wave-slider frequency-slider" min="20" max="2000" value="${this.frequency}" data-wave-id="${this.id}">
          <input type="number" class="wave-input frequency-input" min="20" max="2000" value="${this.frequency}" data-wave-id="${this.id}">
        </div>
        <div class="wave-control-group">
          <label>Amp</label>
          <input type="range" class="wave-slider amplitude-slider" min="0" max="100" value="${this.amplitude}" data-wave-id="${this.id}">
          <input type="number" class="wave-input amplitude-input" min="0" max="100" value="${this.amplitude}" data-wave-id="${this.id}">
        </div>
        <button class="remove-wave-btn" data-wave-id="${this.id}">Remove</button>
      </div>
    `;
    return wrapper;
  }

  initialize() {
    this.canvas = document.getElementById(`wave-${this.id}-canvas`);
    this.context = this.canvas.getContext('2d');

    this.setupControls();
  }

  setupControls() {
    const freqSlider = document.querySelector(`.frequency-slider[data-wave-id="${this.id}"]`);
    const freqInput = document.querySelector(`.frequency-input[data-wave-id="${this.id}"]`);

    freqSlider.addEventListener('input', e => {
      const value = parseFloat(e.target.value);
      freqInput.value = value;
      this.setFrequency(value);
    });

    freqInput.addEventListener('input', e => {
      const value = Math.max(20, Math.min(2000, parseFloat(e.target.value) || 20));
      freqSlider.value = value;
      e.target.value = value;
      this.setFrequency(value);
    });

    const ampSlider = document.querySelector(`.amplitude-slider[data-wave-id="${this.id}"]`);
    const ampInput = document.querySelector(`.amplitude-input[data-wave-id="${this.id}"]`);

    ampSlider.addEventListener('input', e => {
      const value = parseFloat(e.target.value);
      ampInput.value = value;
      this.setAmplitude(value);
    });

    ampInput.addEventListener('input', e => {
      const value = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
      ampSlider.value = value;
      e.target.value = value;
      this.setAmplitude(value);
    });

    const removeBtn = document.querySelector(`.remove-wave-btn[data-wave-id="${this.id}"]`);
    removeBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('removeWave', { detail: this.id }));
    });
  }

  setFrequency(value) {
    this.frequency = value;
    console.log(`Wave ${this.id} frequency set to ${value}`);
  }

  setAmplitude(value) {
    this.amplitude = value;
    console.log(`Wave ${this.id} amplitude set to ${value}`);
  }

  destroy() {
    const el = document.querySelector(`[data-wave-id="${this.id}"]`);
    if (el) el.remove();
  }
}
