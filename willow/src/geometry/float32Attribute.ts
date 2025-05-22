import { Attribute } from "./Attribute";

export class Float32BufferAttribute extends Attribute {
  constructor(arr: number[], itemSize: number) {
    super(new Float32Array(arr), itemSize)
  }
}