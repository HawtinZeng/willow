// Fragment shader program
precision mediump int;
precision highp float;

void main() {

  // The gl_FragCoord.z is a value in the range [0.0, 1.0].
  float z = gl_FragCoord.z;

  // Set the color for debugging purposes.
  gl_FragColor = vec4(z, 0.0, 0.0, 1.0);

  // The real work is being done by the z-buffer hidden surface removal
  // algorithm in the graphics pipeline. The closest z value to the camera
  // is being store in the depth buffer.
}
