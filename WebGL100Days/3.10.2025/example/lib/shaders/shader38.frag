//=========================================================================
// Source: https://raw.githubusercontent.com/ashima/webgl-noise/master/src/classicnoise2D.glsl
//
// GLSL textureless classic 2D noise "cnoise",
// with an RSL-style periodic variant "pnoise".
// Author:  Stefan Gustavson (stefan.gustavson@liu.se)
// Version: 2011-08-22
//
// Many thanks to Ian McEwan of Ashima Arts for the
// ideas for permutation and gradient selection.
//
// Copyright (c) 2011 Stefan Gustavson. All rights reserved.
// Distributed under the MIT license. See LICENSE file.
// https://github.com/ashima/webgl-noise
//

precision mediump int;
precision mediump float;

vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec2 fade(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
float cnoise(vec2 P)
{
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod289(Pi); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;

  vec4 i = permute(permute(ix) + iy);

  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
  vec4 gy = abs(gx) - 0.5 ;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;

  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);

  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;

  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));

  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

//=========================================================================
// Fragment shader
// By: Dr. Wayne Brown, Spring 2016

// Light model
uniform vec3 u_Light_position;
uniform vec3 u_Light_color;
uniform float u_Shininess;
uniform vec3 u_Ambient_color;

// Data coming from the vertex shader
varying vec3 v_Vertex;
varying vec4 v_Color;
varying vec3 v_Normal;
varying vec2 v_Texture_coordinate;

//-------------------------------------------------------------------------
float my_texture(vec2 texture_coordinates) {
  float percent;
  float s = texture_coordinates.s;
  float t = texture_coordinates.t;

  // Scale the texture coordinates and get a random noise value from the
  // texture coordinates.
  percent = cnoise(5.0 * texture_coordinates);

  // Make the pattern periodic, but at a large scale.
  percent = sin(percent * 100.0);

  // Modify the percent from a range of [-1,+1] to a range of [0,+1]
  percent = (percent + 1.0) * 0.5;

  return percent;
}

//-------------------------------------------------------------------------
vec3 light_reflection(vec3 color, vec3 vertex_normal) {

  vec3 to_light;
  vec3 reflection;
  vec3 to_camera;
  float cos_angle;
  vec3 diffuse_color;
  vec3 specular_color;
  vec3 ambient_color;

  // Calculate the ambient color as a percentage of the surface color
  ambient_color = u_Ambient_color * color;

  // Calculate a vector from the fragment location to the light source
  to_light = u_Light_position - v_Vertex;
  to_light = normalize( to_light );

  // Calculate the cosine of the angle between the vertex's normal vector
  // and the vector going to the light.
  cos_angle = dot(vertex_normal, to_light);
  cos_angle = clamp(cos_angle, 0.0, 1.0);

  // Scale the color of this fragment based on its angle to the light.
  diffuse_color = color * cos_angle;

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

  return color;
}

//-------------------------------------------------------------------------
void main() {

  vec3 vertex_normal;
  float percent;
  vec3 color;
  vec3 opposite_color;

  // Step 1: Set the surface's color.
  // For this shader use the surface's color property, a procedural
  // texture, and a gradient to white
  percent = my_texture(v_Texture_coordinate);
  color = vec3(v_Color);
  color = percent * color  + (1.0 - percent) * vec3(1.0, 1.0, 1.0);

  // Step 2: Set the surface's normal vector.
  // For this shader use the surface's normal vector.
  // The vertex's normal vector is being interpolated across the primitive
  // which can make it un-normalized. So normalize the vertex's normal vector.
  vertex_normal = normalize( v_Normal );

  // Step 3: Modify the color based on light reflection
  color = light_reflection(color, vertex_normal);

  // Set the fragment's color, using the surface's color alpha value unchanged.
  gl_FragColor = vec4(color, v_Color.a);
}
