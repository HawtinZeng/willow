// Fragment shader
// By: Dr. Wayne Brown, Spring 2016

precision mediump int;
precision mediump float;

varying vec4 v_vertex_color;
varying vec2 v_texture;

//-------------------------------------------------
// modify the color based on the texture coordinates
vec4 modify_color(vec2 tex_coords, vec4 color) {
  float s = tex_coords[0];
  float t = tex_coords[1];
  vec3 rgb = vec3(color);
  vec4 new_color;

  if ( mod((floor(s/10.0) + floor(t/10.0)),2.0) == 1.0) {
    // Make the color lighter
    new_color = vec4(clamp(rgb * 1.2, 0.0, 1.0), 1.0);
  } else {
    // Make the color darker
    new_color = vec4(rgb * 0.8, 1.0);
  }
  return new_color;
}

//-------------------------------------------------
void main() {
  gl_FragColor = modify_color(v_texture, v_vertex_color);
}
