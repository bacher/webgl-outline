import { createShaderProgram } from './shader';
import { baseVertexShaderInfo } from './shaders/base.vertex';
import { lightFragmentShaderInfo } from './shaders/light.fragment';
import { initModelBuffers } from '../models/f';
import { solidFragmentShaderInfo } from './shaders/solid.fragment';
import { initVao } from './vao';
import { computeMatrices, MatricesResult } from './matrices';
import { degToRad } from './rad';
import { ShaderProgram } from './types';

declare const m4: any;

export function init(gl: WebGL2RenderingContext): {
  setRotation: (value: number) => void;
  drawScene: () => void;
} {
  const lightProgram = createShaderProgram(
    gl,
    baseVertexShaderInfo,
    lightFragmentShaderInfo,
  );

  const solidProgram = createShaderProgram(
    gl,
    baseVertexShaderInfo,
    solidFragmentShaderInfo,
  );

  const { positionBuffer, normalBuffer } = initModelBuffers(gl);

  const lightVao = initVao(gl, {
    position: {
      buffer: positionBuffer,
      attributeLocation: lightProgram.locations.getAttribute('a_position'),
    },
    normal: {
      buffer: normalBuffer,
      attributeLocation: lightProgram.locations.getAttribute('a_normal'),
    },
  });

  const solidVao = initVao(gl, {
    position: {
      buffer: positionBuffer,
      attributeLocation: solidProgram.locations.getAttribute('a_position'),
    },
    normal: {
      buffer: normalBuffer,
      attributeLocation: solidProgram.locations.getAttribute('a_normal'),
    },
  });

  // First let's make some variables
  // to hold the translation,
  let fRotationRadians = 0;

  drawScene();

  // Draw the scene.
  function drawScene() {
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // turn on depth testing
    gl.enable(gl.DEPTH_TEST);

    // tell webgl to cull faces
    gl.enable(gl.CULL_FACE);

    const matrices = computeMatrices({
      state: { fRotationRadians },
      canvas: {
        width: gl.canvas.clientWidth,
        height: gl.canvas.clientHeight,
      },
    });

    drawObject(gl, solidProgram, solidVao, matrices, (program) => {
      program.setUniform4Float('u_color', [0, 0, 0, 1]);
    });

    drawObject(gl, lightProgram, lightVao, matrices, (program) => {
      program.setUniform4Float('u_color', [0.2, 1, 0.2, 1]);

      program.setUniform3Float(
        'u_reverseLightDirection',
        m4.normalize([0.5, 0.7, 1]),
      );
    });
  }

  return {
    setRotation: (value) => {
      fRotationRadians = degToRad(value);
    },
    drawScene,
  };
}

function drawObject(
  gl: WebGL2RenderingContext,
  program: ShaderProgram,
  vao: WebGLVertexArrayObject,
  matrices: MatricesResult,
  setup: (program: ShaderProgram) => void,
): void {
  // Tell it to use our program (pair of shaders)
  // lightProgram.activate();
  program.activate();

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao);

  program.setUniformMat4(
    'u_worldViewProjection',
    matrices.worldViewProjectionMatrix,
  );
  program.setUniformMat4(
    'u_worldInverseTranspose',
    matrices.worldInverseTransposeMatrix,
  );

  setup(program);

  // Draw the geometry.
  const primitiveType = gl.TRIANGLES;
  const offset = 0;
  const count = 16 * 6;
  gl.drawArrays(primitiveType, offset, count);
}
