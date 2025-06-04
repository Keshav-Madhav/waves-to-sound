export class WaveAudio {
  constructor(wave) {
    this.wave = wave;
    this.audioContext = null;
    this.oscillator = null;
    this.gainNode = null;
    this.scriptNode = null;
    this.isPlaying = false;
    this._initializeAudioContext();
  }

  // Initialize the Web Audio API context
  _initializeAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      this._createNodes();
    } catch (e) {
      console.error('Web Audio API is not supported in this browser', e);
    }
  }

  // Create the audio nodes we'll need
  _createNodes() {
    if (!this.audioContext) return;
    
    // Create a gain node to control volume
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = this.wave.amplitude / 100;
    this.gainNode.connect(this.audioContext.destination);
  }

  play() {
    if (!this.wave.isActive || this.isPlaying) return;
    
    // If audio context is suspended, resume it
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    this.isPlaying = true;
    
    // Stop any existing playback
    this._cleanUpNodes();
    this._createNodes();
    
    if (['sine', 'square', 'triangle', 'sawtooth'].includes(this.wave.waveType)) {
      this._playWithNativeOscillator();
    } else {
      this._playWithScriptProcessor();
    }
  }

  stop() {
    if (!this.isPlaying) return;
    
    this._cleanUpNodes();
    this.isPlaying = false;
  }

  _cleanUpNodes() {
    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch (e) {
        console.error('Error stopping oscillator:', e);
      }
      this.oscillator = null;
    }
    
    if (this.scriptNode) {
      this.scriptNode.disconnect();
      this.scriptNode = null;
    }
  }

  // Use native Web Audio oscillator for standard wave types
  _playWithNativeOscillator() {
    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.type = this.wave.waveType;
    this.oscillator.frequency.value = this.wave.frequency;
    this.oscillator.connect(this.gainNode);
    this.oscillator.start();
  }

  // Use script processor for custom wave forms or when we need exact formula matching
  _playWithScriptProcessor() {
    const sampleRate = this.audioContext.sampleRate;
    const bufferSize = 4096;
    
    try {
      const scriptNode = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
      let phase = 0;
      
      scriptNode.onaudioprocess = (e) => {
        if (!this.wave.isActive) return;
        
        const output = e.outputBuffer.getChannelData(0);
        const amplitude = this.wave.amplitude / 100;
        
        for (let i = 0; i < bufferSize; i++) {
          const time = (phase + i) / sampleRate;
          output[i] = this.wave.getValueAtTime(time) * amplitude;
        }
        
        phase += bufferSize;
      };
      
      scriptNode.connect(this.gainNode);
      this.scriptNode = scriptNode;
    } catch (e) {
      console.error('Error creating script processor:', e);
      this._playWithNativeOscillator(); // Fallback
    }
  }

  // Update audio parameters when wave properties change
  update() {
    if (!this.audioContext) return;
    
    // Update gain (volume)
    this.gainNode.gain.value = this.wave.amplitude / 100;
    
    // Update oscillator frequency if using native oscillator
    if (this.oscillator) {
      this.oscillator.frequency.value = this.wave.frequency;
      
      // If wave type changed, we need to recreate the oscillator
      if (this.oscillator.type !== this.wave.waveType) {
        this.stop();
        this.play();
      }
    }
  }

  // Clean up resources
  destroy() {
    this.stop();
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
  }
}