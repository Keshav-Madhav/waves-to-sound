export class WaveAudio {
  constructor(wave) {
    this.wave = wave;
  }
  
  play() {
    console.log(`Audio for wave ${this.wave.id} would play here`);
  }
  
  stop() {
    console.log(`Audio for wave ${this.wave.id} would stop here`);
  }
}