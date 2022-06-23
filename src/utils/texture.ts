export function createEmptyTexture(
  gl: WebGL2RenderingContext,
  canvasSize: { width: number; height: number },
): WebGLTexture {
  // create to render to
  const targetTextureWidth = canvasSize.width;
  const targetTextureHeight = canvasSize.height;

  const targetTexture = gl.createTexture();
  if (!targetTexture) {
    throw new Error("Can't create texture");
  }

  gl.bindTexture(gl.TEXTURE_2D, targetTexture);

  {
    // define size and format of level 0
    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    const data = null;
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      targetTextureWidth,
      targetTextureHeight,
      border,
      format,
      type,
      data,
    );

    // set the filtering so we don't need mips
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  gl.bindTexture(gl.TEXTURE_2D, null);

  return targetTexture;
}

export function createFramebuffer(
  gl: WebGL2RenderingContext,
  targetTexture: WebGLTexture,
): WebGLFramebuffer {
  // Create and bind the framebuffer
  const fb = gl.createFramebuffer();
  if (!fb) {
    throw new Error("Can't create Framebuffer");
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

  // attach the texture as the first color attachment
  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  const level = 0;
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    attachmentPoint,
    gl.TEXTURE_2D,
    targetTexture,
    level,
  );

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  return fb;
}
