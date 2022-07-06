import type { VertexShaderInfo } from '../types';

export const baseVertexShaderInfo: VertexShaderInfo = {
  source: `
uniform mat4 u_worldViewProjection;
uniform mat4 u_modelTransform;
uniform mat4 u_worldInverseTranspose;

in vec4 a_position;
in vec3 a_normal;
out vec3 v_normal;

void main() {
  gl_Position = u_worldViewProjection * u_modelTransform * a_position;
  v_normal = a_normal;
}`,
  uniforms: ['u_worldViewProjection', 'u_worldInverseTranspose', 'u_modelTransform'],
  attributes: ['a_position', 'a_normal'],
};
