// Fill the current ARRAY_BUFFER buffer
// with the values that define a letter 'F'.
function setGeometry(gl: WebGL2RenderingContext, isSquad = false) {
  let positions;

  if (isSquad) {
    positions = new Float32Array([
      // first triangle
      -0.5, 1, 0, 0, 1, 0, 0, 0, 0,
      // second triangle
      -0.5, 1, 0, 0, 0, 0, -0.5, 0, 0,
    ]);
  } else {
    positions = new Float32Array([
      // first triangle
      -1, 1, 0, 1, 1, 0, 1, -1, 0,
      // second triangle
      -1, 1, 0, 1, -1, 0, -1, -1, 0,
    ]);
  }

  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

function setUv(gl: WebGL2RenderingContext) {
  const uv = new Float32Array([
    // first triangle
    0, 1, 1, 1, 1, 0,
    // second triangle
    0, 1, 1, 0, 0, 0,
  ]);

  gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
}

export function initSquareModelBuffers(
  gl: WebGL2RenderingContext,
  isSquad = false,
): {
  positionBuffer: WebGLBuffer;
  uvBuffer: WebGLBuffer;
} {
  // Create a buffer
  const positionBuffer = gl.createBuffer();
  if (!positionBuffer) {
    throw new Error("Can't create buffer");
  }

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Set Geometry.
  setGeometry(gl, isSquad);

  // create the uv buffer, make it the current ARRAY_BUFFER
  // and copy in the normal values
  const uvBuffer = gl.createBuffer();
  if (!uvBuffer) {
    throw new Error("Can't create buffer");
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  setUv(gl);

  return {
    positionBuffer,
    uvBuffer,
  };
}
