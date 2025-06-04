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

  draw(elapsedTime = 0) {
    if (!this.canvas || !this.context || !this.wave.formulaExecutable) return;

    const ctx = this.context;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const padding = 12;
    const drawableHeight = height - 2 * padding;
    const midY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Draw axis line
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();

    // Calculate time per cycle (in seconds)
    const timePerCycle = 1 / this.wave.baseFrequency;
    const totalTime = this.wave.visibleCycles * timePerCycle;

    // Add time markers at each cycle position (showing actual time)
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    
    for (let cycle = 0; cycle <= this.wave.visibleCycles; cycle++) {
      const time = cycle * timePerCycle;
      const xPos = (cycle / this.wave.visibleCycles) * width;
      
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

    // Draw waveform
    const amp = this.wave.amplitude;
    const formula = this.wave.formulaExecutable;
    const step = 0.5;
    const points = Math.floor(width / step);
    const duration = totalTime;
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

    // Draw playback cursor
    if (elapsedTime !== undefined && this.wave.isActive) {
      const cursorX = (elapsedTime * this.wave.baseFrequency % this.wave.visibleCycles) / 
                      this.wave.visibleCycles * width;
      
      ctx.beginPath();
      ctx.moveTo(cursorX, 0);
      ctx.lineTo(cursorX, height);
      ctx.strokeStyle = '#ff8';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}
