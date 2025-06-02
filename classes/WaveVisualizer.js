export class WaveVisualizer {
  constructor(wave) {
    this.wave = wave;
    this.canvas = document.getElementById(`wave-${wave.id}-canvas`);
    this.context = this.canvas?.getContext('2d');
    this.color = this._generateColor(wave.id);
  }

  _generateColor(id) {
    const hue = (id * 137.508) % 360; // Golden angle for distinct colors
    return `hsl(${hue}, 70%, 60%)`;
  }

  resize(height) {
    if (!this.canvas) return;
    const width = this.canvas.parentElement.clientWidth;
    this.canvas.width = width;
    this.canvas.height = height;
    this.draw();
  }

  draw() {
    if (!this.canvas || !this.context || !this.wave.formulaExecutable) return;

    const ctx = this.context;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const padding = 5;
    const drawableHeight = height - 2 * padding;
    const midY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Optional: Draw axis line
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();

    // Draw waveform
    const freq = this.wave.frequency;
    const amp = this.wave.amplitude;
    const formula = this.wave.formulaExecutable;
    const step = 0.5;
    const points = Math.floor(width / step);

    // At 20Hz, we want 1 full cycle across width
    const baseFreq = 20;
    const cycles = freq / baseFreq;
    const duration = cycles / freq; // time span to draw
    const timePerPixel = duration / points;

    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1;

    for (let i = 0; i <= points; i++) {
      const t = i * timePerPixel;
      const x = i * step;
      const y = midY - formula(t) * (amp / 100) * (drawableHeight / 2);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  }

}
