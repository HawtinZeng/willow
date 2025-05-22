// Fragment shader
// By: Dr. Wayne Brown, Spring 2016

precision mediump int;
precision mediump float;

varying vec4 v_vertex_color;
varying vec2 v_Texture_coordinate;

//-------------------------------------------------
// Calculate a color based on the texture coordinates
vec4 gradient(vec2 tex_coords) {
  float s = tex_coords[0];
  float t = tex_coords[1];
  vec3 red = vec3(1.0, 0.0, 0.0);
  float percent;

  percent = s;
  return vec4(red * percent, 1.0);
}

//-------------------------------------------------
void main() {
  gl_FragColor = gradient(v_Texture_coordinate);
}
