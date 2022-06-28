export function createEmptyTexture(
  gl: WebGL2RenderingContext,
  size: { width: number; height: number },
): WebGLTexture {
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
      size.width,
      size.height,
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

export function createRenderBuffer(
  gl: WebGL2RenderingContext,
  size: { width: number; height: number },
): WebGLRenderbuffer {
  const renderbuffer = gl.createRenderbuffer();
  if (!renderbuffer) {
    throw new Error("Can't create Renderbuffer");
  }

  gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
  gl.renderbufferStorage(
    gl.RENDERBUFFER,
    gl.DEPTH_STENCIL,
    size.width,
    size.height,
  );
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);

  return renderbuffer;
}

export function createFramebuffer(
  gl: WebGL2RenderingContext,
  targetTexture: WebGLTexture,
  renderbuffer?: WebGLRenderbuffer,
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

  if (renderbuffer) {
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_STENCIL_ATTACHMENT,
      gl.RENDERBUFFER,
      renderbuffer,
    );
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  return fb;
}
