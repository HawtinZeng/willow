import { Geometry } from "../geometry/Geometry";
import { Material } from "../materials/Basematerial";
import { Object3D } from "./Object3D";
export class Mesh extends Object3D {
  isMesh: boolean = true;
  constructor(public material: Material, public geometry: Geometry) {
    super();
  }
}
