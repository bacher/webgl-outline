import { uniq } from 'lodash-es';

import { FragmentShaderInfo, ShaderProgram, VertexShaderInfo } from './types';

function createShader(
  gl: WebGL2RenderingContext,
  type: GLenum,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error('Shader cant be created');
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    throw new Error('Invalid shader');
  }

  return shader;
}

export function createShaderProgram(
  gl: WebGL2RenderingContext,
  vertexShaderInfo: VertexShaderInfo,
  fragmentShaderInfo: FragmentShaderInfo,
): ShaderProgram {
  const vertexShaderSource = `#version 300 es\n${vertexShaderInfo.source}`;
  const fragmentShaderSource = `#version 300 es\n${fragmentShaderInfo.source}`;

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);

  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  );

  const program = gl.createProgram();

  if (!program) {
    throw new Error('Program cant be created');
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    throw new Error('Invalid program shaders');
  }

  const attributes: Record<string, number> = {};
  const uniforms: Record<string, WebGLUniformLocation | null> = {};

  const allUniforms = uniq([
    ...vertexShaderInfo.uniforms,
    ...fragmentShaderInfo.uniforms,
  ]);

  for (const attributeName of vertexShaderInfo.attributes) {
    const location = gl.getAttribLocation(program, attributeName);

    if (location === -1) {
      throw new Error('Attribute is not found');
    }

    attributes[attributeName] = location;
  }
  for (const uniformName of allUniforms) {
    const location = gl.getUniformLocation(program, uniformName);

    if (!location) {
      // throw new Error('Uniform is not found');
      console.warn(`Uniform "${uniformName} doesn't using`);
    }

    uniforms[uniformName] = location;
  }

  function getAttribute(attributeName: string): number {
    const location = attributes[attributeName];

    if (location === undefined) {
      throw new Error('Invalid attribute');
    }

    return location;
  }

  function getUniform(uniformName: string): WebGLUniformLocation | null {
    const location = uniforms[uniformName];

    if (location === undefined) {
      throw new Error(`Invalid uniform name "${uniformName}"`);
    }

    return location;
  }

  return {
    program,
    activate: () => {
      gl.useProgram(program);
    },
    locations: {
      getUniform,
      getAttribute,
    },
    setUniformInt: (uniformName, value) => {
      gl.uniform1i(getUniform(uniformName), value);
    },
    setUniformUInt: (uniformName, value) => {
      gl.uniform1ui(getUniform(uniformName), value);
    },
    setUniformUIntArray: (uniformName, array) => {
      gl.uniform1uiv(getUniform(uniformName), array);
    },
    setUniform3Float: (uniformName, value) => {
      gl.uniform3fv(getUniform(uniformName), value);
    },
    setUniform4Float: (uniformName, value) => {
      gl.uniform4fv(getUniform(uniformName), value);
    },
    setUniformMat4: (uniformName, value) => {
      gl.uniformMatrix4fv(getUniform(uniformName), false, value);
    },
  };
}
