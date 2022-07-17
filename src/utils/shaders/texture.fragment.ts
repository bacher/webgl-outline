import type { FragmentShaderInfo } from '../types';

export const textureFragmentShaderInfo: FragmentShaderInfo = {
  source: `
precision highp float;

uniform sampler2D u_texture;

in vec2 v_uv;

out vec4 outColor;

void main() {
  outColor = texture(u_texture, v_uv);
}`,
  uniforms: ['u_texture'],
};
