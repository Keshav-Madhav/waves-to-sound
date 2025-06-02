export class WaveFormulas {
  static generate(waveType, amplitude, frequency) {
    const A = amplitude / 100;
    const f = frequency;
    const pi = Math.PI;
    const sign = Math.sign;
    const asin = Math.asin;
    const sin = Math.sin;
    const floor = Math.floor;

    // Executable formulas
    let formulaExecutable;
    switch (waveType) {
      case 'sine':
        formulaExecutable = (t) => A * sin(2 * pi * f * t);
        break;
      case 'square':
        formulaExecutable = (t) => A * sign(sin(2 * pi * f * t));
        break;
      case 'triangle':
        formulaExecutable = (t) => A * (2/pi) * asin(sin(2 * pi * f * t));
        break;
      case 'sawtooth':
        formulaExecutable = (t) => A * 2 * (f * t - floor(0.5 + f * t));
        break;
      case 'reverse-sawtooth':
        formulaExecutable = (t) => A * 2 * (0.5 - (f * t - floor(f * t)));
        break;
      default:
        formulaExecutable = (t) => 0;
    }

    // Display formulas
    const A_display = amplitude;
    const f_display = frequency;
    const pi_display = 'π';
    
    let formulaDisplay;
    switch (waveType) {
      case 'sine':
        formulaDisplay = `${A_display}% × sin(2${pi_display}×${f_display}t)`;
        break;
      case 'square':
        formulaDisplay = `${A_display}% × sign(sin(2${pi_display}×${f_display}t)`;
        break;
      case 'triangle':
        formulaDisplay = `${A_display}% × (2/${pi_display}) × asin(sin(2${pi_display}×${f_display}t)`;
        break;
      case 'sawtooth':
        formulaDisplay = `${A_display}% × 2×(${f_display}t − floor(½ + ${f_display}t))`;
        break;
      case 'reverse-sawtooth':
        formulaDisplay = `${A_display}% × 2×(½ − (${f_display}t − floor(${f_display}t)))`;
        break;
      default:
        formulaDisplay = 'Unknown wave type';
    }

    return { formulaExecutable, formulaDisplay };
  }
}