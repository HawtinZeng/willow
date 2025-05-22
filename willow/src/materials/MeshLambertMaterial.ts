import { MaterialType } from "../renderers/ShaderLib";
import { Material } from "./Basematerial";
// For temporary usage
import { Texture } from "three";

export class MeshLambertMaterial extends Material {
  type: MaterialType;
  emissive: string = "#ffffff";
  constructor(color: string) {
    super(color);
    this.type = MaterialType.MeshLambertMaterial;
  }
}
