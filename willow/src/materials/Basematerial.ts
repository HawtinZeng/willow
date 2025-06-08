import { generateUUID } from "../math/MathUtils";
import { MaterialType } from "../renderers/ShaderLib";
import { NoBlending } from "../constants";

let _materialId = 0;
export class Material {
  userData: Object;
  isMaterial: true = true;
  opacity: number = 1;
  id: number;
  uuid: string;
  type!: MaterialType;
  blending: number = NoBlending;
  aoMap: any;
  vertexColors: any;

  constructor(public color: string = "#ff0000") {
    this.userData = {};
    this.id = _materialId++;
    this.uuid = generateUUID();
  }
}
