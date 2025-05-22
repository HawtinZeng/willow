import { Geometry } from "../geometry/Geometry";
import { Material } from "../materials/Basematerial";
import { Object3D } from "./object3D";
export class Mesh extends Object3D {
  constructor(public material: Material, public geometry: Geometry) {
    super();
  }
}
