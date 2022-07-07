import { mat4, vec3 } from 'gl-matrix';

export function printM4(m: mat4) {
  const lines = [
    [m[0], m[4], m[8], m[12]],
    [m[1], m[5], m[9], m[13]],
    [m[2], m[6], m[10], m[14]],
    [m[3], m[7], m[11], m[15]],
  ];

  console.log(`matrix: [${printLine(lines[0])}
         ${printLine(lines[1])}
         ${printLine(lines[2])}
         ${printLine(lines[3])} ]`);

  function printLine(line: number[]) {
    const fixed = 6;
    const pad = fixed + 4;

    return `${line[0].toFixed(fixed).padStart(pad, ' ')} ${line[1]
      .toFixed(fixed)
      .padStart(pad, ' ')} ${line[2]
      .toFixed(fixed)
      .padStart(pad, ' ')} ${line[3].toFixed(fixed).padStart(pad, ' ')}`;
  }
}

export function printVec3(v: vec3) {
  console.log(`vec3: [ ${printLine(v)} ]`);

  function printLine(line: vec3) {
    const fixed = 6;
    const pad = fixed + 4;

    return `${line[0].toFixed(fixed).padStart(pad, ' ')} ${line[1]
      .toFixed(fixed)
      .padStart(pad, ' ')} ${line[2].toFixed(fixed).padStart(pad, ' ')}`;
  }
}
