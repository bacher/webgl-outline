import type { VertexShaderInfo } from '../types';

export const flatVertexShaderInfo: VertexShaderInfo = {
  source: `
in vec4 a_position;
in vec2 a_uv;

out vec2 v_uv;

void main() {
  gl_Position = a_position;
  v_uv = a_uv;
}`,
  uniforms: [],
  attributes: ['a_position', 'a_uv'],
};
