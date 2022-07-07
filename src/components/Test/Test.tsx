import { useEffect, useState } from 'react';
import { vec3, mat4 } from 'gl-matrix';
import { printM4 } from '../../utils/debug';

declare const m4: any;

export function Test() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    test(0);
  }, []);

  return (
    <div>
      <div>TEST</div>
      <div>
        <input
          type="range"
          value={value}
          min={0}
          max={100}
          onChange={(event) => {
            const newValue = parseFloat(event.target.value);
            setValue(newValue);

            test(newValue);
          }}
        />
      </div>
    </div>
  );
}

function test(val: number) {
  const m = mat4.create();
  // const m2 = mat4.create();

  // console.log('val =', val);

  // mat4.perspective(m, Math.PI / 2, 800 / 600, val / 1000, 1000);

  mat4.rotateX(m, m, 0.43 * Math.PI);
  mat4.rotateY(m, m, 0.21 * Math.PI);
  // mat4.translate(m, m, [42, 21, 7]);
  mat4.scale(m, m, [3.3, 3.3, 3.3]);

  // mat4.invert(m2, m);

  // const v = vec3.fromValues(10, 15, -5);
  //
  // vec3.transformMat4(v, v, m);
  //
  // console.log('v =', v);
  //
  // const back = vec3.fromValues(52, 5.901323318481445, 35.56929016113281);
  //
  // vec3.transformMat4(back, back, m2);
  //
  // console.log('b =', back);
  //
  // const rotM = m4.yRotation(0.3 * Math.PI);
  // const rotMInv = m4.inverse(rotM);
  //
  // const rotM2 = mat4.fromYRotation(mat4.create(), 0.3 * Math.PI);
  // const rotM2Inv = mat4.invert(mat4.create(), rotM2);
  // printM4(rotM);
  // printM4(rotM2);
  //
  // printM4(rotMInv);
  // printM4(rotM2Inv);

  return;

  const m1 = m4.inverse(m);
  const m2 = m4.transpose(m1);
  //const m2 = mat4.invert(mat4.create(), m);

  console.log('Result:');
  printM4(m);
  // printM4(m1);
  printM4(m2);

  const init = vec3.fromValues(10, 15, -7);

  const v1 = vec3.transformMat4(vec3.create(), init, m);
  const v2 = vec3.transformMat4(vec3.create(), init, m2);

  vec3.normalize(v1, v1);
  vec3.normalize(v2, v2);

  console.log('v1', v1);
  console.log('v2', v2);
}
