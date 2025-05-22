// Vertex Shader
// By: Dr. Wayne Brown, Spring 2016

precision mediump int;
precision mediump float;

uniform   mat4 u_Transform;

attribute vec3 a_Vertex;
attribute vec3 a_Color;

varying vec4 v_vertex_color;

void main() {
  // Transform the location of the vertex
  gl_Position = u_Transform * vec4(a_Vertex, 1.0);

  v_vertex_color = vec4(a_Color, 1.0);
}
