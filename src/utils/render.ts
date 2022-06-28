import { createShaderProgram } from './shader';
import { baseVertexShaderInfo } from './shaders/base.vertex';
import { lightFragmentShaderInfo } from './shaders/light.fragment';
import { initModelBuffers } from '../models/f';
import { solidFragmentShaderInfo } from './shaders/solid.fragment';
import { initVao } from './vao';
import { computeMatrices, MatricesResult } from './matrices';
import { degToRad } from './rad';
import { ShaderProgram } from './types';
import {
  createEmptyTexture,
  createFramebuffer,
  createRenderBuffer,
} from './texture';
import { flatVertexShaderInfo } from './shaders/flat.vertex';
import { textureFragmentShaderInfo } from './shaders/texture.fragment';
import { initSquareModelBuffers } from '../models/square';

declare const m4: any;

export function init(
  gl: WebGL2RenderingContext,
  canvasSize: { width: number; height: number },
): {
  setRotation: (value: number) => void;
  drawScene: () => void;
} {
  const solidProgram = createShaderProgram(
    gl,
    baseVertexShaderInfo,
    solidFragmentShaderInfo,
  );

  const outlineProgram = createShaderProgram(
    gl,
    flatVertexShaderInfo,
    textureFragmentShaderInfo,
  );

  const lightProgram = createShaderProgram(
    gl,
    baseVertexShaderInfo,
    lightFragmentShaderInfo,
  );

  const fModel = initModelBuffers(gl);
  const squareModel = initSquareModelBuffers(gl);

  const solidVao = initVao(gl, {
    position: {
      buffer: fModel.positionBuffer,
      attributeLocation: solidProgram.locations.getAttribute('a_position'),
    },
    normal: {
      buffer: fModel.normalBuffer,
      attributeLocation: solidProgram.locations.getAttribute('a_normal'),
    },
  });

  const outlineVao = initVao(gl, {
    position: {
      buffer: squareModel.positionBuffer,
      attributeLocation: outlineProgram.locations.getAttribute('a_position'),
    },
    uv: {
      buffer: squareModel.uvBuffer,
      attributeLocation: outlineProgram.locations.getAttribute('a_uv'),
    },
  });

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

  const solidSceneTexture = createEmptyTexture(gl, canvasSize);
  const solidRenderbuffer = createRenderBuffer(gl, canvasSize);
  const solidSceneFb = createFramebuffer(
    gl,
    solidSceneTexture,
    solidRenderbuffer,
  );

  const blurredTexture = createEmptyTexture(gl, canvasSize);
  const blurredFb = createFramebuffer(gl, blurredTexture);

  // First let's make some variables
  // to hold the translation,
  let fRotationRadians = 0;

  drawFrame();

  // Draw the frame.
  function drawFrame() {
    const matrices = computeMatrices({
      state: { fRotationRadians },
      aspectRatio: canvasSize.width / canvasSize.height,
    });

    drawScene(
      {
        depthTest: false,
        cullFace: true,
        stencil: true,
        framebuffer: solidSceneFb,
      },
      () => {
        gl.stencilFunc(gl.ALWAYS, 1, 0xff);
        gl.stencilOp(
          gl.KEEP, // what to do if the stencil test fails
          gl.KEEP, // what to do if the depth test fails
          gl.REPLACE, // what to do if both tests pass
        );

        drawObject(gl, solidProgram, solidVao, matrices, (program) => {
          program.setUniform4Float('u_color', [1, 0, 0, 1]);
        });
      },
    );

    drawScene(
      { depthTest: false, cullFace: false, framebuffer: blurredFb },
      () => {
        outlineProgram.activate();

        // Bind the attribute/buffer set we want.
        gl.bindVertexArray(outlineVao);

        gl.bindTexture(gl.TEXTURE_2D, solidSceneTexture);

        outlineProgram.setUniformInt('u_texture', 0);
        outlineProgram.setUniformFloat('u_x_shift', 1 / canvasSize.width);
        outlineProgram.setUniformFloat('u_y_shift', 1 / canvasSize.height);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      },
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, solidSceneFb);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    gl.blitFramebuffer(
      0,
      0,
      canvasSize.width,
      canvasSize.height,
      0,
      0,
      canvasSize.width,
      canvasSize.height,
      gl.STENCIL_BUFFER_BIT,
      gl.NEAREST,
    );

    /*
    gl.bindFramebuffer(gl.FRAMEBUFFER, solidSceneFb);
    console.log('aaa', gl.getParameter(gl.SAMPLES));
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    console.log('bbb', gl.getParameter(gl.SAMPLES));
     */

    drawScene({ depthTest: false, cullFace: false, stencil: true }, () => {
      gl.stencilFunc(
        gl.EQUAL, // the test
        0, // reference value
        0xff, // mask
      );
      gl.stencilOp(
        gl.KEEP, // what to do if the stencil test fails
        gl.KEEP, // what to do if the depth test fails
        gl.KEEP, // what to do if both tests pass
      );

      outlineProgram.activate();

      // Bind the attribute/buffer set we want.
      gl.bindVertexArray(outlineVao);

      gl.bindTexture(gl.TEXTURE_2D, blurredTexture);

      outlineProgram.setUniformInt('u_texture', 0);
      outlineProgram.setUniformFloat('u_x_shift', 3 / canvasSize.width);
      outlineProgram.setUniformFloat('u_y_shift', 3 / canvasSize.height);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    });

    /*
    drawScene({ depthTest: true, cullFace: true, clear: false }, () => {
      drawObject(gl, lightProgram, lightVao, matrices, (program) => {
        program.setUniform4Float('u_color', [0.2, 1, 0.2, 1]);

        program.setUniform3Float(
          'u_reverseLightDirection',
          m4.normalize([0.5, 0.7, 1]),
        );
      });
    });
    */
  }

  // Draw the scene.
  function drawScene(
    {
      depthTest,
      cullFace,
      clear = true,
      stencil,
      framebuffer,
    }: {
      depthTest: boolean;
      cullFace: boolean;
      clear?: boolean;
      stencil?: boolean;
      framebuffer?: WebGLFramebuffer;
    },
    drawCallback: () => void,
  ) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer ?? null);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, canvasSize.width, canvasSize.height);

    if (clear) {
      // Clear the canvas
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    if (depthTest) {
      gl.enable(gl.DEPTH_TEST);
    } else {
      gl.disable(gl.DEPTH_TEST);
    }

    if (cullFace) {
      gl.enable(gl.CULL_FACE);
    } else {
      gl.disable(gl.CULL_FACE);
    }

    if (stencil) {
      gl.enable(gl.STENCIL_TEST);
    } else {
      gl.disable(gl.STENCIL_TEST);
    }

    drawCallback();
  }

  return {
    setRotation: (value) => {
      fRotationRadians = degToRad(value);
    },
    drawScene: drawFrame,
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
