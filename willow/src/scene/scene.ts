import { Mesh } from "../objects/mesh";

export class Scene {
  public meshes: Mesh[] = [];
  add(mesh: Mesh) {
    this.meshes.push(mesh);
  }
}
