import { initModelBuffers } from '../../models/f';
import { initSquareModelBuffers } from '../../models/square';
import { createShaderProgram } from '../shader';
import { baseVertexShaderInfo } from '../shaders/base.vertex';
import { lightFragmentShaderInfo } from '../shaders/light.fragment';
import { solidFragmentShaderInfo } from '../shaders/solid.fragment';
import { initVao } from '../vao';
import { applyMatrices, computeMatrices } from '../matrices';
import { degToRad } from '../rad';
import {
  createEmptyTexture,
  createFramebuffer,
  createRenderBuffer,
  FramebufferBufferType,
} from '../texture';
import { flatVertexShaderInfo } from '../shaders/flat.vertex';
import { textureFragmentShaderInfo } from '../shaders/texture.fragment';
import { drawObject } from '../drawObject';
import { activateFramebuffer } from '../framebuffer';

declare const m4: any;

export function init(
  gl: WebGL2RenderingContext,
  canvasSize: { width: number; height: number },
): {
  setRotation: (value: number) => void;
  draw: () => void;
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
    { type: FramebufferBufferType.TEXTURE, texture: solidSceneTexture },
    solidRenderbuffer,
  );

  const blurredTexture = createEmptyTexture(gl, canvasSize);
  const blurredFb = createFramebuffer(gl, {
    type: FramebufferBufferType.TEXTURE,
    texture: blurredTexture,
  });

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

    activateFramebuffer(
      gl,
      {
        framebuffer: solidSceneFb,
        size: canvasSize,
        clearMask:
          gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT,
      },
      () => {
        gl.stencilFunc(gl.ALWAYS, 1, 0xff);
        gl.stencilOp(
          gl.KEEP, // what to do if the stencil test fails
          gl.KEEP, // what to do if the depth test fails
          gl.REPLACE, // what to do if both tests pass
        );

        drawObject(
          gl,
          solidProgram,
          solidVao,
          {
            depthTest: false,
            cullFace: true,
            stencilTest: true,
            verticesCount: 16 * 6,
          },
          (program) => {
            applyMatrices(program, matrices);
            program.setUniform4Float('u_color', [1, 0, 0, 1]);
          },
        );
      },
    );

    activateFramebuffer(
      gl,
      { framebuffer: blurredFb, size: canvasSize },
      () => {
        drawObject(
          gl,
          outlineProgram,
          outlineVao,
          { depthTest: false, cullFace: false, verticesCount: 6 },
          (program) => {
            gl.bindTexture(gl.TEXTURE_2D, solidSceneTexture);

            program.setUniformInt('u_texture', 0);
            program.setUniformFloat('u_x_shift', 1 / canvasSize.width);
            program.setUniformFloat('u_y_shift', 1 / canvasSize.height);
          },
        );
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

    activateFramebuffer(gl, { size: canvasSize }, () => {
      drawObject(
        gl,
        outlineProgram,
        outlineVao,
        {
          depthTest: false,
          cullFace: false,
          stencilTest: true,
          verticesCount: 6,
        },
        (program) => {
          gl.bindTexture(gl.TEXTURE_2D, blurredTexture);

          program.setUniformInt('u_texture', 0);
          program.setUniformFloat('u_x_shift', 3 / canvasSize.width);
          program.setUniformFloat('u_y_shift', 3 / canvasSize.height);

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
        },
      );

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
          applyMatrices(program, matrices);

          program.setUniform4Float('u_color', [0.2, 1, 0.2, 1]);
          program.setUniform3Float(
            'u_reverseLightDirection',
            m4.normalize([0.5, 0.7, 1]),
          );
        },
      );
    });
  }

  return {
    setRotation: (value) => {
      fRotationRadians = degToRad(value);
    },
    draw: drawFrame,
  };
}