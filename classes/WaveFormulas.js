export class WaveFormulas {
  static generate(waveType, amplitude, frequency, phaseShift = 0) {
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
        formulaExecutable = (t) => A * sin(2 * pi * f * t + phaseShift);
        break;
      case 'square':
        formulaExecutable = (t) => A * sign(sin(2 * pi * f * t + phaseShift));
        break;
      case 'triangle':
        formulaExecutable = (t) => A * (2/pi) * asin(sin(2 * pi * f * t + phaseShift));
        break;
      case 'sawtooth':
        formulaExecutable = (t) => A * 2 * (f * (t + phaseShift/(2*pi*f)) - floor(0.5 + f * (t + phaseShift/(2*pi*f))));
        break;
      case 'reverse-sawtooth':
        formulaExecutable = (t) => A * 2 * (0.5 - (f * (t + phaseShift/(2*pi*f)) - floor(f * (t + phaseShift/(2*pi*f)))));
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
        formulaDisplay = `${A_display}% × sin(2${pi_display}×${f_display}t + ${phaseShift})`;
        break;
      case 'square':
        formulaDisplay = `${A_display}% × sign(sin(2${pi_display}×${f_display}t + ${phaseShift}))`;
        break;
      case 'triangle':
        formulaDisplay = `${A_display}% × (2/${pi_display}) × asin(sin(2${pi_display}×${f_display}t + ${phaseShift}))`;
        break;
      case 'sawtooth':
        formulaDisplay = `${A_display}% × 2×(${f_display}(t + ${phaseShift}/(2${pi_display}×${f_display})) − floor(0.5 + ${f_display}(t + ${phaseShift}/(2${pi_display}×${f_display}))))`;
        break;
      case 'reverse-sawtooth':
        formulaDisplay = `${A_display}% × 2×(0.5 − (${f_display}(t + ${phaseShift}/(2${pi_display}×${f_display})) − floor(${f_display}(t + ${phaseShift}/(2${pi_display}×${f_display})))))`;
        break;
      default:
        formulaDisplay = 'Unknown wave type';
    }

    return { formulaExecutable, formulaDisplay };
  }
}