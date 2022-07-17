import type { FragmentShaderInfo } from '../types';

export const outlineFragmentShaderInfo: FragmentShaderInfo = {
  source: `
precision highp float;

uniform sampler2D u_texture;
uniform float u_x_shift;
uniform float u_y_shift;

in vec2 v_uv;

out vec4 outColor;

void main() {
  outColor = texture(u_texture, v_uv);
  outColor += texture(u_texture, vec2(v_uv.x + u_x_shift, v_uv.y));
  outColor += texture(u_texture, vec2(v_uv.x - u_x_shift, v_uv.y));
  outColor += texture(u_texture, vec2(v_uv.x, v_uv.y + u_y_shift));
  outColor += texture(u_texture, vec2(v_uv.x, v_uv.y - u_y_shift));
  outColor += texture(u_texture, vec2(v_uv.x + u_x_shift, v_uv.y + u_y_shift));
  outColor += texture(u_texture, vec2(v_uv.x - u_x_shift, v_uv.y + u_y_shift));
  outColor += texture(u_texture, vec2(v_uv.x + u_x_shift, v_uv.y - u_y_shift));
  outColor += texture(u_texture, vec2(v_uv.x - u_x_shift, v_uv.y - u_y_shift));
  outColor += texture(u_texture, vec2(v_uv.x + 2.0 * u_x_shift, v_uv.y));
  outColor += texture(u_texture, vec2(v_uv.x - 2.0 * u_x_shift, v_uv.y));
  outColor += texture(u_texture, vec2(v_uv.x, v_uv.y + 2.0 * u_y_shift));
  outColor += texture(u_texture, vec2(v_uv.x, v_uv.y - 2.0 * u_y_shift));

  if (outColor.r == 0.0) {
    discard;
  }
}`,
  uniforms: ['u_texture', 'u_x_shift', 'u_y_shift'],
};
