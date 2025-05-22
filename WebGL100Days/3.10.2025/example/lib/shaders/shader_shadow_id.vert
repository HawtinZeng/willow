// Vertex Shader
precision mediump int;
precision highp float;

// Scene transformations
uniform mat4 u_PVM_transform; // Projection, view, model transform
uniform mat4 u_VM_transform;  // View, model transform
uniform mat4 u_Shadowmap_transform; // The transform used to render the shadow map
uniform int  u_Model_id;      // A unique identifier for the model

// Light model
uniform vec3 u_Light_position;
uniform vec3 u_Light_color;
uniform float u_Shininess;
uniform vec3 u_Ambient_color;

// Original model data
attribute vec3  a_Vertex;
attribute vec3  a_Color;
attribute vec3  a_Vertex_normal;
attribute float a_Surface_id;     // A unique identifer for each triangle.

// Data (to be interpolated) that is passed on to the fragment shader
varying vec3 v_Vertex;
varying vec4 v_Color;
varying vec3 v_Normal;
varying vec4 v_Vertex_relative_to_light;

varying float v_Surface_id; // pass the surface ID onto the fragment shader

void main() {

  // Set the unique ID for this triangle.
  v_Surface_id = a_Surface_id;

  // Perform the model and view transformations on the vertex and pass this
  // location to the fragment shader.
  v_Vertex = vec3( u_VM_transform * vec4(a_Vertex, 1.0) );

  // Calculate this vertex's location from the light source. This is
  // used in the fragment shader to determine if fragments receive direct light.
  v_Vertex_relative_to_light = u_Shadowmap_transform * vec4(a_Vertex, 1.0);

  // Perform the model and view transformations on the vertex's normal vector
  // and pass this normal vector to the fragment shader.
  v_Normal = vec3( u_VM_transform * vec4(a_Vertex_normal, 0.0) );

  // Pass the vertex's color to the fragment shader.
  v_Color = vec4(a_Color, 1.0);

  // Transform the location of the vertex for the rest of the graphics pipeline
  gl_Position = u_PVM_transform * vec4(a_Vertex, 1.0);
}