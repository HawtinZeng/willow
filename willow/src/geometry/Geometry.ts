import {
  BufferAttribute,
  Uint16BufferAttribute,
  Uint32BufferAttribute,
} from "../core/BufferAttribute";
import { arrayNeedsUint32 } from "../renderers/utils";
import { EventDispatcher } from "../tool/EventDispatcher";
export class Geometry extends EventDispatcher {
  attributes: any = {};
  drawRange: { start: number; count: number } = { start: 0, count: Infinity };
  groups: { start: number; count: number; materialIndex: number }[] = [];
  groupStart: number = 0;
  index!: BufferAttribute;
  setAttribute(name: string, attribute: BufferAttribute) {
    attribute.name = name;
    this.attributes[name] = attribute;
  }
  getAttribute(name: string) {
    return this.attributes[name];
  }
  addGroup(start: number, count: number, materialIndex = 0) {
    this.groups.push({
      start: start,
      count: count,
      materialIndex: materialIndex,
    });
  }
  setIndex(index: number[]) {
    if (Array.isArray(index)) {
      this.index = new (
        arrayNeedsUint32(index) ? Uint32BufferAttribute : Uint16BufferAttribute
      )(index, 1);
      this.index.name = "index";
    } else {
      this.index = index;
    }

    return this;
  }
}
