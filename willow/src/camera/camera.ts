import { Matrix4 } from "../math/Matrix4";
import { Object3D } from "../objects/Object3D";

export class Camera extends Object3D {
  projectionMatrix: Matrix4 = new Matrix4();
  isOrthographicCamera: boolean = false;
  get matrixWorldInverse() {
    return this.matrixWorld.invert();
  }
}
