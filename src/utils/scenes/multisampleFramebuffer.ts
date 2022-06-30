import { initModelBuffers } from '../../models/f';
import { createShaderProgram } from '../shader';
import { baseVertexShaderInfo } from '../shaders/base.vertex';
import { solidFragmentShaderInfo } from '../shaders/solid.fragment';
import { initVao } from '../vao';
import { applyMatrices, computeMatrices } from '../matrices';
import { degToRad } from '../rad';
import {
  createFramebuffer,
  createRenderBuffer,
  createRenderbufferSampled,
  FramebufferBufferType,
} from '../texture';
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

  const fModel = initModelBuffers(gl);

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

  //const solidSceneTexture = createEmptyTexture(gl, canvasSize);
  const solidColorRenderbuffer = createRenderbufferSampled(gl, canvasSize, 4);
  const solidDepthStencilRenderbuffer = createRenderBuffer(gl, canvasSize);
  const solidSceneFramebuffer = createFramebuffer(
    gl,
    {
      type: FramebufferBufferType.RENDERBUFFER,
      buffer: solidColorRenderbuffer,
    },
    // solidDepthStencilRenderbuffer,
  );

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
        framebuffer: solidSceneFramebuffer,
        size: canvasSize,
      },
      () => {
        drawObject(
          gl,
          solidProgram,
          solidVao,
          { depthTest: false, cullFace: true, verticesCount: 16 * 6 },
          (program) => {
            applyMatrices(program, matrices);
            program.setUniform4Float('u_color', [1, 0, 0, 1]);
          },
        );
      },
    );

    // this time render to the default buffer, which is just canvas
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, solidSceneFramebuffer);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    // gl.clearBufferfv(gl.COLOR, 0, [1.0, 1.0, 1.0, 1.0]);
    gl.blitFramebuffer(
      // size read
      0,
      0,
      canvasSize.width,
      canvasSize.height,
      // size draw
      0,
      0,
      canvasSize.width,
      canvasSize.height,
      gl.COLOR_BUFFER_BIT,
      gl.LINEAR, // or gl.NEAREST
    );
  }

  return {
    setRotation: (value) => {
      fRotationRadians = degToRad(value);
    },
    draw: drawFrame,
  };
}
