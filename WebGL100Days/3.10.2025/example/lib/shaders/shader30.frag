// Fragment shader program
precision mediump int;
precision mediump float;

// The texture unit to use for the color lookup
uniform sampler2D u_Sampler;

// Data coming from the vertex shader
varying vec2 v_Texture_coordinate;

void main() {

  gl_FragColor = texture2D(u_Sampler, v_Texture_coordinate);
}
