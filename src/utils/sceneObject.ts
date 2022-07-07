import { mat4, quat } from 'gl-matrix';

export type SceneObject = {
  position: [number, number, number];
  scale: number;
  rotation: quat;
  rotationInvert: quat;
  color: [number, number, number, number];
  matrix: mat4;
};

export function createSceneObject(
  params: Omit<SceneObject, 'matrix' | 'rotationInvert'>,
): SceneObject {
  const mat = mat4.create();
  mat4.fromRotationTranslationScale(mat, params.rotation, params.position, [
    params.scale,
    params.scale,
    params.scale,
  ]);

  return {
    ...params,
    rotationInvert: quat.invert(quat.create(), params.rotation),
    matrix: mat,
  };
}
