import { Vector3 } from "../math/Vector3";
import { Matrix4 } from "../math/Matrix4";
import { Quaternion } from "../math/Quaternion";

export class Object3D {
  position: Vector3 = new Vector3();
  scale: Vector3 = new Vector3();
  quaternion: Quaternion = new Quaternion();

  constructor() {}

  get matrix() {
    const _matrix = new Matrix4();
    _matrix.compose(this.position, this.quaternion, this.scale);
    return _matrix;
  }

  get matrixWorld() {
    // TODO: ADD PARENT TO OBJECT3D
    return this.matrix;
  }
}
