import { Color } from "../math/Color";
import { MaterialType } from "../renderers/ShaderLib";
import { Material } from "./Basematerial";
// For temporary usage

export class MeshLambertMaterial extends Material {
  type: MaterialType;
  emissive: Color = new Color("#ffffff");
  constructor(color: string) {
    super(color);
    this.type = MaterialType.MeshLambertMaterial;
  }
}
