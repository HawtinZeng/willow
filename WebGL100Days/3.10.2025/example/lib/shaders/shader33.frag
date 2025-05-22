// Fragment shader
// By: Dr. Wayne Brown, Spring 2016

precision mediump int;
precision mediump float;

varying vec4 v_vertex_color;
varying vec2 v_Texture_coordinate;

float PI = 3.141592653589793;

//-------------------------------------------------
// Calculate a pattern based on the texture coordinates
float circular_gradient(vec2 tex_coords, float scale) {
  float s = tex_coords[0];
  float t = tex_coords[1];

  float percent = abs(sin(s * scale*PI)) * abs(sin(t * scale*PI));
  return percent;
}

//-------------------------------------------------
// Calculate a color based on a pattern defined
// by the texture coordinates
vec4 overlay(vec2 tex_coords) {
  vec3 red = vec3(1.0, 0.0, 0.0);

  const int n = 1;
  float scale = 1.0;
  float percent = 0.0;
  for (int j=0; j<n; j++) {
    percent += (1.0/float(n)) * circular_gradient(tex_coords, scale);
    scale *= 2.0;
  }

  return vec4(red * percent, 1.0);
}

//-------------------------------------------------
void main() {
  gl_FragColor = overlay(v_Texture_coordinate);
}
