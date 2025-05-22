// Fragment shader program
precision highp int;
precision highp float;

uniform int  u_Model_id;      // A unique identifier for the model

varying float v_Surface_id;

const float scale = pow(2.0, 8.0) - 1.0; // 255.0
const int green_shift = int(pow(2.0, 16.0)); // 256*256
const int blue_shift  = int(pow(2.0, 8.0));  // 256

void main() {

  // Put the model and surface ID into the color of this fragment
  int id = int(v_Surface_id);
  int green = id / green_shift;
  id = id - (green * green_shift);
  int blue = id / blue_shift;
  int alpha = id - (blue * blue_shift);

  gl_FragColor = vec4(float(u_Model_id)/scale, float(green)/scale, float(blue)/scale, float(alpha)/scale);
}
