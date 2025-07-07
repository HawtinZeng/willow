import { DoubleSide } from "../constants";
import { Color } from "../math/Color";
import { MaterialType } from "../renderers/ShaderLib";
import { Material } from "./Basematerial";
// For temporary usage

export class MeshLambertMaterial extends Material {
  type: MaterialType;
  side: number = DoubleSide;
  emissive: Color = new Color(0xffffff);
  emissiveIntensity: number = 0.2;

  constructor(color: string) {
    super(color);
    this.type = MaterialType.MeshLambertMaterial;
  }
}
