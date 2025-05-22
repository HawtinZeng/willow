// Vertex Shader
precision mediump int;
precision mediump float;

// Scene transformations
uniform mat4 u_PVM_transform; // Projection, view, model transform

// Light model
uniform vec3 u_Ambient_color;

// Original model data
attribute vec3 a_Vertex;
attribute vec3 a_Color;

// Data (to be interpolated) that is passed on to the fragment shader
varying vec4 v_Color;

void main() {

  // Pass the vertex's color to the fragment shader.
  v_Color = vec4(a_Color, 1.0);

  // Transform the location of the vertex for the rest of the graphics pipeline
  gl_Position = u_PVM_transform * vec4(a_Vertex, 1.0);
}