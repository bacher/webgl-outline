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
import {
  createEmptyTexture,
  createFramebuffer,
  createRenderBuffer,
  FramebufferBufferType,
} from '../texture';
import { flatVertexShaderInfo } from '../shaders/flat.vertex';
import { textureFragmentShaderInfo } from '../shaders/texture.fragment';

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

  const textureProgram = createShaderProgram(
    gl,
    flatVertexShaderInfo,
    textureFragmentShaderInfo,
  );

  const fModel = initModelBuffers(gl);
  const squareModel = initSquareModelBuffers(gl, true);

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

  const squareVao = initVao(gl, {
    position: {
      buffer: squareModel.positionBuffer,
      attributeLocation: textureProgram.locations.getAttribute('a_position'),
    },
    uv: {
      buffer: squareModel.uvBuffer,
      attributeLocation: textureProgram.locations.getAttribute('a_uv'),
    },
  });

  const squareSize = {
    width: canvasSize.width * (3 / 8),
    height: canvasSize.height / 2,
  };

  // const squareSceneTexture = createEmptyTexture(gl, squareSize);
  const squareSceneTexture = createRenderBuffer(gl, squareSize, true);
  const squareRenderbuffer = createRenderBuffer(gl, squareSize);
  const squareSceneFb = createFramebuffer(
    gl,
    { type: FramebufferBufferType.RENDERBUFFER, buffer: squareSceneTexture },
    squareRenderbuffer,
  );

  let fRotationRadians = 0;

  drawFrame();

  // Draw the frame.
  function drawFrame() {
    activateFramebuffer(
      gl,
      { framebuffer: squareSceneFb, size: squareSize },
      () => {
        const matrices = computeMatrices({
          state: { fRotationRadians },
          aspectRatio: canvasSize.width / canvasSize.height,
          isUseSquare: true,
        });

        const worldInvert = mat4.invert(mat4.create(), matrices.worldMatrix);
        const worldLight = vec3.transformMat4(
          vec3.create(),
          globalLight,
          worldInvert,
        );

        lightProgram.activate();
        applyMatrices(lightProgram, matrices);

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
      },
    );

    activateFramebuffer(gl, { size: canvasSize }, () => {
      const matrices = computeMatrices({
        state: { fRotationRadians },
        aspectRatio: canvasSize.width / canvasSize.height,
      });

      const worldInvert = mat4.invert(mat4.create(), matrices.worldMatrix);
      const worldLight = vec3.transformMat4(
        vec3.create(),
        globalLight,
        worldInvert,
      );

      lightProgram.activate();
      applyMatrices(lightProgram, matrices);

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

      // drawObject(
      //   gl,
      //   textureProgram,
      //   squareVao,
      //   { depthTest: false, cullFace: false, verticesCount: 6 },
      //   (program) => {
      //     gl.bindTexture(gl.TEXTURE_2D, squareSceneTexture);
      //     program.setUniformInt('u_texture', 0);
      //   },
      // );
    });

    gl.bindFramebuffer(gl.FRAMEBUFFER, squareSceneFb);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    gl.blitFramebuffer(
      0,
      0,
      squareSize.width,
      squareSize.height,
      canvasSize.width / 8,
      squareSize.height,
      canvasSize.width / 8 + squareSize.width,
      squareSize.height + squareSize.height,
      gl.COLOR_BUFFER_BIT,
      gl.LINEAR,
    );
  }

  return {
    setRotation: (value) => {
      fRotationRadians = degToRad(value);
    },
    draw: drawFrame,
  };
}
