// Fragment shader program
precision mediump int;
precision highp float;

// The sampler used to get pixels out of the texture map
uniform sampler2D u_Sampler;
uniform float     u_Tolerance_constant;
uniform int       u_Model_id;      // A unique identifier for the model

// Light model
uniform vec3 u_Light_position;
uniform vec3 u_Light_color;
uniform float u_Shininess;
uniform vec3 u_Ambient_color;

// Data coming from the vertex shader
varying vec3 v_Vertex;
varying vec4 v_Color;
varying vec3 v_Normal;
varying vec4 v_Vertex_relative_to_light;

varying float v_Surface_id; // pass the surface ID onto the fragment shader

//-------------------------------------------------------------------------
bool in_shadow(void) {

  // The vertex location rendered from the light source is almost in Normalized
  // Device Coordinates (NDC), but the perspective division has not been
  // performed yet. Perform the perspective divide. The (x,y,z) vertex location
  // components are now each in the range [-1.0,+1.0].
  vec3 vertex_relative_to_light = v_Vertex_relative_to_light.xyz / v_Vertex_relative_to_light.w;

  // Convert the the values in the Normalized Device Coordinates in the
  // range [-1.0,+1.0] to the range [0.0,1.0]. This mapping is done by scaling
  // the values by 0.5, which gives values in the range [-0.5,+0.5] and then
  // shifting the values by +0.5.
  vertex_relative_to_light = vertex_relative_to_light * 0.5 + 0.5;

  // Get the z value of this fragment in relationship to the light source.
  // This value was stored in the depth buffer of the shadow map frame buffer
  // which was passed to the shader as a texture map.
  vec4 shadowmap_color = texture2D(u_Sampler, vertex_relative_to_light.xy);

  // Get the ID of the closest model to the light from the red component of the color.
  int direct_light_model_id = int(shadowmap_color.r * 255.0);

  // Get the ID of the closest surface to the light
  int direct_light_surface_id = int(shadowmap_color.g * 255.0) * 256*256
                              + int(shadowmap_color.b * 255.0) * 256
                              + int(shadowmap_color.a * 255.0);

  //float t = float(direct_light_surface_id) / 30.0;
  //gl_FragColor = vec4(shadowmap_color.a/2.0, 0.0, 0.0, 1.0);
  //gl_FragColor = vec4(shadowmap_color.r, 0.0, 0.0, 1.0);
  //return true;

  // Does this surface match the surface recorded in the shadowmap?
  if ( u_Model_id == direct_light_model_id &&
       int(v_Surface_id) == direct_light_surface_id) {
    // This surface receives full light because it was the closest surface
    // to the light.
    return false;
  } else {
    // This surface is in a shadow because there is a closer surface to
    // the light source.
    return true;
  }
}

//-------------------------------------------------------------------------
void main() {

  vec3 to_light;
  vec3 vertex_normal;
  vec3 reflection;
  vec3 to_camera;
  float cos_angle;
  vec3 diffuse_color;
  vec3 specular_color;
  vec3 ambient_color;
  vec3 color;

  // Calculate the ambient color as a percentage of the surface color
  ambient_color = u_Ambient_color * vec3(v_Color);

  if (in_shadow()) {
    // This fragment only receives ambient light because it is in a shadow.
    //gl_FragColor = vec4(1.0, 0.0, 0.0, v_Color.a);
    gl_FragColor = vec4(ambient_color, v_Color.a);
    return;
  }
  //return;

  // Calculate a vector from the fragment location to the light source
  to_light = u_Light_position - v_Vertex;
  to_light = normalize( to_light );

  // The vertex's normal vector is being interpolated across the primitive
  // which can make it un-normalized. So normalize the vertex's normal vector.
  vertex_normal = normalize( v_Normal );

  // Calculate the cosine of the angle between the vertex's normal vector
  // and the vector going to the light.
  cos_angle = dot(vertex_normal, to_light);
  cos_angle = clamp(cos_angle, 0.0, 1.0);

  // Scale the color of this fragment based on its angle to the light.
  diffuse_color = vec3(v_Color) * cos_angle;

  // Calculate the reflection vector
  reflection = 2.0 * dot(vertex_normal,to_light) * vertex_normal - to_light;

  // Calculate a vector from the fragment location to the camera.
  // The camera is at the origin, so negating the vertex location gives the vector
  to_camera = -1.0 * v_Vertex;

  // Calculate the cosine of the angle between the reflection vector
  // and the vector going to the camera.
  reflection = normalize( reflection );
  to_camera = normalize( to_camera );
  cos_angle = dot(reflection, to_camera);
  cos_angle = clamp(cos_angle, 0.0, 1.0);
  cos_angle = pow(cos_angle, u_Shininess);

  // The specular color is from the light source, not the object
  if (cos_angle > 0.0) {
    specular_color = u_Light_color * cos_angle;
    diffuse_color = diffuse_color * (1.0 - cos_angle);
  } else {
    specular_color = vec3(0.0, 0.0, 0.0);
  }

  color = ambient_color + diffuse_color + specular_color;

  gl_FragColor = vec4(color, v_Color.a);
}
