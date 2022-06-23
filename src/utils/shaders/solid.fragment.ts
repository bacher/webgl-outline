import type { FragmentShaderInfo } from '../types';

export const solidFragmentShaderInfo: FragmentShaderInfo = {
  source: `
precision highp float;

uniform vec4 u_color;

out vec4 outColor;

void main() {
  outColor = u_color;
}`,
  uniforms: ['u_color'],
};
