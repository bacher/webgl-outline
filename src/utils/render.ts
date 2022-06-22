import { createShaderProgram } from './shader';
import { baseVertexShaderInfo } from './shaders/base.vertex';
import { lightFragmentShaderInfo } from './shaders/light.fragment';
import { setGeometry, setNormals } from '../models/f';

declare const m4: any;

export function init(gl: WebGL2RenderingContext): {
  setRotation: (value: number) => void;
  drawScene: () => void;
} {
  const program = createShaderProgram(
    gl,
    baseVertexShaderInfo,
    lightFragmentShaderInfo,
  );

  const positionAttributeLocation =
    program.locations.getAttribute('a_position');
  const normalAttributeLocation = program.locations.getAttribute('a_normal');

  // Create a buffer
  const positionBuffer = gl.createBuffer();

  // Create a vertex array object (attribute state)
  const vao = gl.createVertexArray();

  // and make it the one we're currently working with
  gl.bindVertexArray(vao);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Set Geometry.
  setGeometry(gl);

  {
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    const size = 3; // 3 components per iteration
    const type = gl.FLOAT; // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(
      positionAttributeLocation,
      size,
      type,
      normalize,
      stride,
      offset,
    );
  }

  // create the normalr buffer, make it the current ARRAY_BUFFER
  // and copy in the normal values
  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  setNormals(gl);

  // Turn on the attribute
  gl.enableVertexAttribArray(normalAttributeLocation);

  {
    // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
    const size = 3; // 3 components per iteration
    const type = gl.FLOAT; // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next color
    const offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(
      normalAttributeLocation,
      size,
      type,
      normalize,
      stride,
      offset,
    );
  }

  function radToDeg(r: number) {
    return (r * 180) / Math.PI;
  }

  function degToRad(d: number) {
    return (d * Math.PI) / 180;
  }

  // First let's make some variables
  // to hold the translation,
  const fieldOfViewRadians = degToRad(60);
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

    // Tell it to use our program (pair of shaders)
    program.activate();

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);

    // Compute the matrix
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 1;
    const zFar = 2000;
    const projectionMatrix = m4.perspective(
      fieldOfViewRadians,
      aspect,
      zNear,
      zFar,
    );

    // Compute the camera's matrix
    const camera = [100, 150, 200];
    const target = [0, 35, 0];
    const up = [0, 1, 0];
    const cameraMatrix = m4.lookAt(camera, target, up);

    // Make a view matrix from the camera matrix.
    const viewMatrix = m4.inverse(cameraMatrix);

    // create a viewProjection matrix. This will both apply perspective
    // AND move the world so that the camera is effectively the origin
    const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    // Draw a F at the origin with rotation
    const worldMatrix = m4.yRotation(fRotationRadians);
    const worldViewProjectionMatrix = m4.multiply(
      viewProjectionMatrix,
      worldMatrix,
    );
    const worldInverseMatrix = m4.inverse(worldMatrix);
    const worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);

    program.setUniformMat4('u_worldViewProjection', worldViewProjectionMatrix);
    program.setUniformMat4(
      'u_worldInverseTranspose',
      worldInverseTransposeMatrix,
    );

    program.setUniform4Float('u_color', [0.2, 1, 0.2, 1]);

    program.setUniform3Float(
      'u_reverseLightDirection',
      m4.normalize([0.5, 0.7, 1]),
    );

    // Draw the geometry.
    const primitiveType = gl.TRIANGLES;
    const offset = 0;
    const count = 16 * 6;
    gl.drawArrays(primitiveType, offset, count);
  }

  return {
    setRotation: (value) => {
      fRotationRadians = degToRad(value);
    },
    drawScene,
  };
}
