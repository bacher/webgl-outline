import { vec3, vec4, quat, mat3, mat4 } from 'gl-matrix';

import { initModelBuffers } from '../../models/f';
import { initSquareModelBuffers } from '../../models/square';
import { createShaderProgram } from '../shader';
import { baseVertexShaderInfo } from '../shaders/base.vertex';
import { lightFragmentShaderInfo } from '../shaders/light.fragment';
import { initVao } from '../vao';
import { applyMatrices, computeMatrices } from '../matrices';
import { degToRad } from '../rad';
import { drawObject } from '../drawObject';
import { activateFramebuffer } from '../framebuffer';
import { createSceneObject, SceneObject } from '../sceneObject';

declare const m4: any;

const globalLight = m4.normalize([0.5, 0.7, 1]);

function getRandomRotation(): quat {
  const q = quat.create();

  quat.rotateZ(q, q, Math.random() * Math.PI);
  quat.rotateY(q, q, Math.random() * Math.PI);
  quat.rotateX(q, q, Math.random() * Math.PI);

  return q;
}

const sceneObjects: SceneObject[] = [
  createSceneObject({
    position: [0, 0, 0],
    scale: 1,
    rotation: quat.create(),
    color: [0.2, 1, 0.2, 1],
  }),
  createSceneObject({
    position: [-150, 0, 0],
    scale: 0.7,
    rotation: getRandomRotation(),
    color: [0.8, 0.2, 0.2, 1],
  }),
  createSceneObject({
    position: [-100, 0, -100],
    scale: 0.7,
    rotation: getRandomRotation(),
    color: [0.6, 0.6, 0.2, 1],
  }),
  createSceneObject({
    position: [0, 0, -150],
    scale: 0.7,
    rotation: getRandomRotation(),
    color: [0.4, 0.4, 0.8, 1],
  }),
];

export function init(
  gl: WebGL2RenderingContext,
  canvasSize: { width: number; height: number },
): {
  setRotation: (value: number) => void;
  draw: () => void;
} {
  const lightProgram = createShaderProgram(
    gl,
    baseVertexShaderInfo,
    lightFragmentShaderInfo,
  );

  const fModel = initModelBuffers(gl);
  const squareModel = initSquareModelBuffers(gl);

  const lightVao = initVao(gl, {
    position: {
      buffer: fModel.positionBuffer,
      attributeLocation: lightProgram.locations.getAttribute('a_position'),
    },
    normal: {
      buffer: fModel.normalBuffer,
      attributeLocation: lightProgram.locations.getAttribute('a_normal'),
    },
  });

  let fRotationRadians = 0;

  drawFrame();

  // Draw the frame.
  function drawFrame() {
    const matrices = computeMatrices({
      state: { fRotationRadians },
      aspectRatio: canvasSize.width / canvasSize.height,
    });

    activateFramebuffer(gl, { size: canvasSize }, () => {
      lightProgram.activate();
      applyMatrices(lightProgram, matrices);

      const worldInvert = mat4.invert(mat4.create(), matrices.worldMatrix);
      const worldLight = vec3.transformMat4(
        vec3.create(),
        globalLight,
        worldInvert,
      );

      for (const sceneObject of sceneObjects) {
        drawObject(
          gl,
          lightProgram,
          lightVao,
          {
            depthTest: true,
            cullFace: true,
            verticesCount: 16 * 6,
          },
          (program) => {
            program.setUniformMat4('u_modelTransform', sceneObject.matrix);

            const light = vec3.transformQuat(
              vec3.create(),
              worldLight,
              sceneObject.rotationInvert,
            );

            vec3.normalize(light, light);

            program.setUniform3Float('u_reverseLightDirection', light);
            program.setUniform4Float('u_color', sceneObject.color);
          },
        );
      }
    });
  }

  return {
    setRotation: (value) => {
      fRotationRadians = degToRad(value);
    },
    draw: drawFrame,
  };
}
