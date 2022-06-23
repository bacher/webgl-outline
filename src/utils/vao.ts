type AttributeInformation = {
  buffer: WebGLBuffer;
  attributeLocation: number;
};

export function initVao(
  gl: WebGL2RenderingContext,
  {
    position,
    normal,
    uv,
  }: {
    position: AttributeInformation;
    normal?: AttributeInformation;
    uv?: AttributeInformation;
  },
): WebGLVertexArrayObject {
  // Create a vertex array object (attribute state)
  const vao = gl.createVertexArray();
  if (!vao) {
    throw new Error("Can't create VAO");
  }

  // and make it the one we're currently working with
  gl.bindVertexArray(vao);

  // Turn on the attribute
  gl.enableVertexAttribArray(position.attributeLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, position.buffer);

  {
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    const size = 3; // 3 components per iteration
    const type = gl.FLOAT; // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(
      position.attributeLocation,
      size,
      type,
      normalize,
      stride,
      offset,
    );
  }

  if (normal) {
    // Turn on the attribute
    gl.enableVertexAttribArray(normal.attributeLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, normal.buffer);

    {
      // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
      const size = 3; // 3 components per iteration
      const type = gl.FLOAT; // the data is 32bit floats
      const normalize = false; // don't normalize the data
      const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next color
      const offset = 0; // start at the beginning of the buffer
      gl.vertexAttribPointer(
        normal.attributeLocation,
        size,
        type,
        normalize,
        stride,
        offset,
      );
    }
  }

  if (uv) {
    // Turn on the attribute
    gl.enableVertexAttribArray(uv.attributeLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, uv.buffer);

    {
      // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
      const size = 2; // 3 components per iteration
      const type = gl.FLOAT; // the data is 32bit floats
      const normalize = false; // don't normalize the data
      const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next color
      const offset = 0; // start at the beginning of the buffer
      gl.vertexAttribPointer(
        uv.attributeLocation,
        size,
        type,
        normalize,
        stride,
        offset,
      );
    }
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindVertexArray(null);

  return vao;
}
