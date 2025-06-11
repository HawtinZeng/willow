import { Vector3 } from "../math/Vector3";
import { Float32BufferAttribute } from "./float32Attribute";
import { Geometry } from "./Geometry";

export class BoxGeometry extends Geometry {
  numberOfVertices: number = 0;
  indices: number[] = [];
  constructor(width: number, height: number, depth: number) {
    super();
    const vertices: number[] = [];
    const px = this.getPlaneVertices(
      "z",
      "y",
      "x",
      -1,
      -1,
      depth,
      height,
      width,
      1,
      1,
      0
    ); // px
    const nx = this.getPlaneVertices(
      "z",
      "y",
      "x",
      1,
      -1,
      depth,
      height,
      -width,
      1,
      1,
      1
    ); // nx
    const py = this.getPlaneVertices(
      "x",
      "z",
      "y",
      1,
      1,
      width,
      depth,
      height,
      1,
      1,
      2
    ); // py
    const ny = this.getPlaneVertices(
      "x",
      "z",
      "y",
      1,
      -1,
      width,
      depth,
      -height,
      1,
      1,
      3
    ); // ny
    const pz = this.getPlaneVertices(
      "x",
      "y",
      "z",
      1,
      -1,
      width,
      height,
      depth,
      1,
      1,
      4
    ); // pz
    const nz = this.getPlaneVertices(
      "x",
      "y",
      "z",
      -1,
      -1,
      width,
      height,
      -depth,
      1,
      1,
      5
    ); // nz
    vertices.push(...[...px, ...nx, ...py, ...ny, ...pz, ...nz]);

    this.setIndex(this.indices);
    this.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  }

  getPlaneVertices(
    u,
    v,
    w,
    udir,
    vdir,
    width,
    height,
    depth,
    gridX,
    gridY,
    materialIndex
  ) {
    const vertices: number[] = [];
    const segmentWidth = width / gridX;
    const segmentHeight = height / gridY;

    const widthHalf = width / 2;
    const heightHalf = height / 2;
    const depthHalf = depth / 2;

    const gridX1 = gridX + 1;
    const gridY1 = gridY + 1;

    let vertexCounter = 0;
    let groupCount = 0;

    const vector = new Vector3();

    for (let iy = 0; iy < gridY1; iy++) {
      const y = iy * segmentHeight - heightHalf;

      for (let ix = 0; ix < gridX1; ix++) {
        const x = ix * segmentWidth - widthHalf;

        // set values to correct vector component
        vector[u] = x * udir;
        vector[v] = y * vdir;
        vector[w] = depthHalf;

        vertices.push(vector.x, vector.y, vector.z);
        vertexCounter += 1;
      }
    }

    for (let iy = 0; iy < gridY; iy++) {
      for (let ix = 0; ix < gridX; ix++) {
        const a = this.numberOfVertices + ix + gridX1 * iy;
        const b = this.numberOfVertices + ix + gridX1 * (iy + 1);
        const c = this.numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
        const d = this.numberOfVertices + (ix + 1) + gridX1 * iy;

        // faces

        this.indices.push(a, b, d);
        this.indices.push(b, c, d);

        // increase counter

        groupCount += 6;
      }
    }

    this.addGroup(this.groupStart, groupCount, materialIndex);
    this.groupStart += groupCount;

    return vertices;
  }
}
