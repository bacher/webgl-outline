import { degToRad } from './rad';
import { ShaderProgram } from './types';

declare const m4: any;

export type MatricesResult = {
  worldViewProjectionMatrix: number[];
  worldInverseTransposeMatrix: number[];
};

export function computeMatrices({
  state,
  aspectRatio,
}: {
  state: { fRotationRadians: number };
  aspectRatio: number;
}): MatricesResult {
  const fieldOfViewRadians = degToRad(60);

  // Compute the matrix
  const projectionMatrix = m4.perspective(
    fieldOfViewRadians,
    aspectRatio,
    1,
    2000,
  );

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
