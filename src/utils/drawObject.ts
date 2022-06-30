import type { ShaderProgram } from './types';

export type DrawOptions = {
  cullFace?: boolean;
  stencilTest?: boolean;
  depthTest?: boolean;
  verticesCount: number;
};

export function drawObject(
  gl: WebGL2RenderingContext,
  program: ShaderProgram,
  vao: WebGLVertexArrayObject,
  options: DrawOptions,
  setup: (program: ShaderProgram) => void,
): void {
  if (options.depthTest) {
    gl.enable(gl.DEPTH_TEST);
  } else {
    gl.disable(gl.DEPTH_TEST);
  }

  if (options.cullFace) {
    gl.enable(gl.CULL_FACE);
  } else {
    gl.disable(gl.CULL_FACE);
  }

  if (options.stencilTest) {
    gl.enable(gl.STENCIL_TEST);
  } else {
    gl.disable(gl.STENCIL_TEST);
  }

  // Tell it to use our program (pair of shaders)
  program.activate();

  setup(program);

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao);

  // Draw the geometry.
  const offset = 0;
  gl.drawArrays(gl.TRIANGLES, offset, options.verticesCount);
}
