import { Attribute } from "./Attribute";
export class Geometry {
  attributes: any = {};
  drawRange: { start: number; end: number } = { start: 0, end: Infinity };
  setAttribute(name: string, attribute: Attribute) {
    this.attributes[name] = attribute;
  }
  getAttribute(name: string) {
    return this.attributes[name];
  }
}
