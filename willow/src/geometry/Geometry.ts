import { Attribute } from "./Attribute";
export class Geometry {
  attributes: any = {};
  setAttribute(name: string, attribute: Attribute) {
    this.attributes[name] = attribute;
  }
  getAttribute(name: string) {
    return this.attributes[name];
  }
}
