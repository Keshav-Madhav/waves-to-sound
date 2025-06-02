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
    if (!this.context || !this.canvas) return;
    
    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerY = height / 2;
    const samples = width;
    
    this.context.clearRect(0, 0, width, height);
    this.context.beginPath();
    
    for (let x = 0; x < samples; x++) {
      const t = x / samples;
      const value = this.wave.getValueAtTime(t);
      const y = centerY - (value * centerY);
      
      if (x === 0) {
        this.context.moveTo(x, y);
      } else {
        this.context.lineTo(x, y);
      }
    }
    
    this.context.strokeStyle = this.color;
    this.context.lineWidth = 1;
    this.context.stroke();
  }
}