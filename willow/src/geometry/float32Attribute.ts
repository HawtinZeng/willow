import { BufferAttribute } from "../core/BufferAttribute";

export class Float32BufferAttribute extends BufferAttribute {
  constructor(arr: number[], itemSize: number) {
    super(new Float32Array(arr), itemSize);
  }
}
