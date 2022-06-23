import type { FragmentShaderInfo } from '../types';

export const lightFragmentShaderInfo: FragmentShaderInfo = {
  source: `
precision highp float;

uniform vec3 u_reverseLightDirection;
uniform vec4 u_color;

in vec3 v_normal;

out vec4 outColor;

void main() {
  vec3 normal = normalize(v_normal);

  float light = dot(normal, u_reverseLightDirection);

  outColor = u_color;

  outColor.rgb *= light;
}`,
  uniforms: ['u_reverseLightDirection', 'u_color'],
};
