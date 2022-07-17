import { mat4 } from 'gl-matrix';

import { degToRad } from './rad';
import { ShaderProgram } from './types';

declare const m4: any;

export type MatricesResult = {
  worldMatrix: mat4;
  worldViewProjectionMatrix: mat4;
  worldInverseTransposeMatrix: mat4;
};

export function computeMatrices({
  state,
  aspectRatio,
  isUseSquare = false,
}: {
  state: { fRotationRadians: number };
  aspectRatio: number;
  isUseSquare?: boolean;
}): MatricesResult {
  const fieldOfViewRadians = degToRad(60);

  let projectionMatrix: mat4;

  if (isUseSquare) {
    projectionMatrix = mat4.perspectiveFromFieldOfView(
      mat4.create(),
      {
        upDegrees: 30,
        downDegrees: 0,
        // leftDegrees: 0 + (window as any)._value,
        leftDegrees: 30,
        // leftDegrees: 49.1 / 2,
        // Why width 800 = > 49.1, but width 400 => 30 ?
        rightDegrees: 0,
      },
      1,
      2000,
    );
  } else {
    projectionMatrix = mat4.perspective(
      mat4.create(),
      fieldOfViewRadians,
      aspectRatio,
      1,
      2000,
    );
  }

  // Compute the camera's matrix
  const camera = [100, 150, 200];
  const target = [0, 35, 0];
  const up = [0, 1, 0];
  const cameraMatrix = m4.lookAt(camera, target, up);

  // Make a view matrix from the camera matrix.
  const viewMatrix = m4.inverse(cameraMatrix);

  // create a viewProjection matrix. This will both apply perspective
  // AND move the world so that the camera is effectively the origin
  const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

  // Draw a F at the origin with rotation
  const worldMatrix = m4.yRotation(state.fRotationRadians);
  const worldViewProjectionMatrix = m4.multiply(
    viewProjectionMatrix,
    worldMatrix,
  );
  const worldInverseMatrix = m4.inverse(worldMatrix);
  const worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);

  return {
    worldMatrix,
    worldViewProjectionMatrix,
    worldInverseTransposeMatrix,
  };
}

export function applyMatrices(
  program: ShaderProgram,
  matrices: MatricesResult,
): void {
  program.setUniformMat4(
    'u_worldViewProjection',
    matrices.worldViewProjectionMatrix,
  );
  program.setUniformMat4(
    'u_worldInverseTranspose',
    matrices.worldInverseTransposeMatrix,
  );
}

export function interpolateMat4(m1: mat4, m2: mat4, lerp: number): mat4 {
  const lerp1 = 1 - lerp;

  return [
    m1[0] * lerp1 + m2[0] * lerp,
    m1[1] * lerp1 + m2[1] * lerp,
    m1[2] * lerp1 + m2[2] * lerp,
    m1[3] * lerp1 + m2[3] * lerp,
    m1[4] * lerp1 + m2[4] * lerp,
    m1[5] * lerp1 + m2[5] * lerp,
    m1[6] * lerp1 + m2[6] * lerp,
    m1[7] * lerp1 + m2[7] * lerp,
    m1[8] * lerp1 + m2[8] * lerp,
    m1[9] * lerp1 + m2[9] * lerp,
    m1[10] * lerp1 + m2[10] * lerp,
    m1[11] * lerp1 + m2[11] * lerp,
    m1[12] * lerp1 + m2[12] * lerp,
    m1[13] * lerp1 + m2[13] * lerp,
    m1[14] * lerp1 + m2[14] * lerp,
    m1[15] * lerp1 + m2[15] * lerp,
  ];
}
