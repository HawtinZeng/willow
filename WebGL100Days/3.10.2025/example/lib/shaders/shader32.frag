// Fragment shader
// By: Dr. Wayne Brown, Spring 2016

precision mediump int;
precision mediump float;

varying vec4 v_vertex_color;
varying vec2 v_Texture_coordinate;

//-------------------------------------------------
// Calculate a pattern based on the texture coordinates
float checkerboard(vec2 tex_coords, float scale) {
  float s = tex_coords[0];
  float t = tex_coords[1];

  float sum = floor(s * scale) + floor(t * scale);
  bool isEven = mod(sum,2.0)==0.0;
  float percent = (isEven) ? 1.0 : 0.0;

  return percent;
}

//-------------------------------------------------
// Calculate a color based on a pattern defined
// by the texture coordinates
vec4 overlay(vec2 tex_coords) {
  vec3 red = vec3(1.0, 0.0, 0.0);

  float percent = checkerboard(tex_coords, 3.0);

  return vec4(red * percent, 1.0);
}

//-------------------------------------------------
void main() {
  gl_FragColor = overlay(v_Texture_coordinate);
}
