// Vertex Shader
precision highp int;
precision highp float;

// Scene transformations
uniform mat4 u_PVM_transform; // Projection, view, model transform
uniform int  u_Model_id;      // A unique identifier for the model

// Original model data
attribute vec3  a_Vertex;
attribute float a_Surface_id;     // A unique identifer for each triangle.

varying float v_Surface_id; // pass the surface ID onto the fragment shader

// Shadow map processing.
// The view transform puts the light source at the origin.
void main() {

  // Set the unique ID for this triangle.
  v_Surface_id = a_Surface_id;

  // Transform the location of the vertex for the graphics pipeline
  gl_Position = u_PVM_transform * vec4(a_Vertex, 1.0);
}