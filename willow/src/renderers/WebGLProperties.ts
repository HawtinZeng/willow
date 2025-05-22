export class WebGLProperties {
  properties = new WeakMap();

  has(object: any) {
    return this.properties.has(object);
  }

  get(object: any) {
    let map = this.properties.get(object);

    if (map === undefined) {
      map = {};
      this.properties.set(object, map);
    }

    return map;
  }

  remove(object: any) {
    this.properties.delete(object);
  }

  update(object: any, key: any, value: any) {
    this.properties.get(object)[key] = value;
  }

  dispose() {
    this.properties = new WeakMap();
  }
}
