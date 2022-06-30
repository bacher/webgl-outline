import type { Size } from './types';

export function activateFramebuffer(
  gl: WebGL2RenderingContext,
  {
    framebuffer,
    clear = true,
    clearMask,
    size,
  }: {
    framebuffer?: WebGLFramebuffer;
    clear?: boolean;
    clearMask?: number;
    size: Size;
  },
  drawCallback: () => void,
) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer ?? null);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, size.width, size.height);

  if (clear) {
    // Clear the buffer
    gl.clearColor(0, 0, 0, 0);
    gl.clear(clearMask ?? gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  drawCallback();
}
