// Vertex Shader
precision mediump int;
precision highp float;

// Scene transformations
uniform mat4 u_PVM_transform; // Projection, view, model transform

// Original model data
attribute vec3 a_Vertex;

// Shadow map processing. The view transform puts the light source
// at the origin.
void main() {

  // Transform the location of the vertex for the graphics pipeline
  gl_Position = u_PVM_transform * vec4(a_Vertex, 1.0);
}