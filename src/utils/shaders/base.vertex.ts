import type { VertexShaderInfo } from '../types';

export const baseVertexShaderInfo: VertexShaderInfo = {
  source: `
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

in vec4 a_position;
in vec3 a_normal;
out vec3 v_normal;

void main() {
  gl_Position = u_worldViewProjection * a_position;
  v_normal = mat3(u_worldInverseTranspose) * a_normal;
}`,
  uniforms: ['u_worldViewProjection', 'u_worldInverseTranspose'],
  attributes: ['a_position', 'a_normal'],
};
