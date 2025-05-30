import { Matrix4 } from "../math/Matrix4";
import { Object3D } from "../objects/object3D";

export class Camera extends Object3D {
  projectionMatrix: Matrix4 = new Matrix4();
  get matrixWorldInverse() {
    return this.matrixWorld.invert();
  }
}
