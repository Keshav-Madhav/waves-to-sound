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

  play(startTime = 0) {
    if (!this.wave.isActive || this.isPlaying) return;
    
    if (!this.audioContext) this._initializeAudioContext();
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    this.isPlaying = true;
    this._cleanUpNodes();
    this._createNodes();
    
    const adjustedStartTime = startTime || this.audioContext.currentTime;
    
    if (['sine', 'square', 'triangle', 'sawtooth'].includes(this.wave.waveType)) {
      this._playWithNativeOscillator(adjustedStartTime);
    } else {
      this._playWithScriptProcessor(adjustedStartTime);
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
  _playWithNativeOscillator(startTime) {
    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.type = this.wave.waveType;
    this.oscillator.frequency.value = this.wave.frequency;
    this.oscillator.connect(this.gainNode);
    
    // Set initial phase for synchronization
    const initialPhase = (this.wave.phaseShift * Math.PI) / 180;
    this.oscillator.start(startTime);
    
    // For WebAudio's native oscillators, we can't set phase directly after start,
    // so we set it via detune which gives us phase control
    this.oscillator.detune.value = (initialPhase * 180 / Math.PI) * 1200 / 360;
  }

  _playWithScriptProcessor(startTime) {
    const sampleRate = this.audioContext.sampleRate;
    const bufferSize = 4096;
    
    try {
      const scriptNode = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
      let phase = 0;
      
      scriptNode.onaudioprocess = (e) => {
        if (!this.wave.isActive) return;
        
        const output = e.outputBuffer.getChannelData(0);
        const amplitude = this.wave.amplitude / 100;
        const currentTime = this.audioContext.currentTime;
        const elapsed = currentTime - startTime;
        
        for (let i = 0; i < bufferSize; i++) {
          const time = elapsed + (i / sampleRate);
          output[i] = this.wave.getValueAtTime(time) * amplitude;
        }
      };
      
      scriptNode.connect(this.gainNode);
      this.scriptNode = scriptNode;
    } catch (e) {
      console.error('Error creating script processor:', e);
      this._playWithNativeOscillator(startTime); // Fallback
    }
  }

  update() {
    if (!this.audioContext) return;
    
    // Update gain (volume)
    this.gainNode.gain.value = this.wave.amplitude / 100;
    
    if (this.oscillator) {
      // If wave type changed to a custom type, switch to script processor
      if (!['sine', 'square', 'triangle', 'sawtooth'].includes(this.wave.waveType)) {
        this.stop();
        this.play();
        return;
      }
      
      // Update oscillator frequency and type
      this.oscillator.frequency.value = this.wave.frequency;
      this.oscillator.type = this.wave.waveType;
    } else if (this.scriptNode) {
      // If wave type changed to a standard type, switch to native oscillator
      if (['sine', 'square', 'triangle', 'sawtooth'].includes(this.wave.waveType)) {
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