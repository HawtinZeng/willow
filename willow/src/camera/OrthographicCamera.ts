import { Camera } from "./camera";

export class OrthographicCamera extends Camera {
  constructor(
    public left: number = -1,
    public right: number = 1,
    public top: number = 1,
    public bottom: number = -1,
    public near: number = 0.1,
    public far: number = 2000,
    public zoom: number = 1
  ) {
    super();
  }
  updateProjectionMatrix() {
    const dx = (this.right - this.left) / (2 * this.zoom);
    const dy = (this.top - this.bottom) / (2 * this.zoom);
    const cx = (this.right + this.left) / 2;
    const cy = (this.top + this.bottom) / 2;

    let left = cx - dx;
    let right = cx + dx;
    let top = cy + dy;
    let bottom = cy - dy;
    this.projectionMatrix.makeOrthographic(left, right, top, bottom, this.near);
  }
}
