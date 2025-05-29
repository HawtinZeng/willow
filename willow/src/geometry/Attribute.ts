export class Attribute {
  count: number;
  constructor(public array: Float32Array, public itemSize: number) {
    this.count = array.length / itemSize;
  }
}
