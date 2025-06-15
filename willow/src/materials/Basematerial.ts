import { generateUUID } from "../math/MathUtils";
import { MaterialType } from "../renderers/ShaderLib";
import { NoBlending } from "../constants";
import { Color } from "../math/Color";

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
  color: Color;

  constructor(color: string = "#ff0000") {
    this.color = new Color(color);
    this.userData = {};
    this.id = _materialId++;
    this.uuid = generateUUID();
  }
}
