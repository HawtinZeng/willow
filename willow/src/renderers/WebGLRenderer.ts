import { WebGLProgram as WebGLProgram_w } from "./WebGLProgram";
import { Camera } from "../camera/camera";
import { Geometry } from "../geometry/Geometry";
import { Material } from "../materials/Basematerial";
import { Mesh } from "../objects/mesh";
import { Object3D } from "../objects/object3D";
import { Scene } from "../scene/scene";
import { WebGLProperties } from "./WebGLProperties";
import { WebGLClipping } from "./WebGLClipping";
import { WebGLExtensions } from "./WebGLExtensions";
import { WebGLState } from "./WebGLState";
import { WebGLRenderState } from "./WebGLRenderStates";

export class WebGLRenderer {
  private currentState: any;
  private canvas: HTMLCanvasElement;
  private gl!: WebGL2RenderingContext;
  private static properties: WebGLProperties = new WebGLProperties();
  private clipping: WebGLClipping = new WebGLClipping();
  extensions: any;
  state: any;
  renderState: any;
  diagnostics: any;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext("webgl2");
    if (!context) {
      console.error(
        'canvas.getContext("webgl2") returns null, pls check the webgl2 compatibility'
      );
      return;
    }
    this.gl = context;
    this.extensions = new (WebGLExtensions as any)(this.gl);
    this.extensions.init();

    this.state = new (WebGLState as any)(this.gl, this.extensions);
    this.renderState = new (WebGLRenderState as any)(this.extensions);
    this.renderState.init();
  }

  render(scene: Scene, camera: Camera) {
    // get all objects.
    // for each object, bind buffer and drawArray
    this.renderObjects(scene, camera);
  }
  renderObjects(scene: Scene, camera: Camera) {
    scene.meshes.forEach((item: any) => {
      this.renderObject(item, camera, scene);
    });
  }
  renderObject(object: Mesh, camera: Camera, scene: Scene) {
    const gl = this.gl;
    const geo = object.geometry;
    const mat = object.material;

    const program = this.getProgram(camera, scene, geo, mat, object);

    const frontFaceCW = true;
    this.state.setMaterial(mat, frontFaceCW);

    // setup vao
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao); // TODO
    // setup vertex buffer

    // pass attributes

    // calculate draw start and end position
    const position = geo.position;
    gl.drawArrays(gl.TRIANGLES, 0, position.count);
  }

  getProgram(
    ca: Camera,
    scene: Scene,
    geo: Geometry,
    mat: Material,
    obj: Object3D
  ) {
    const programCacheKey = this.getProgramCacheKey(mat);

    const materialPros = WebGLRenderer.properties.get(mat);
    let programs = materialPros.programs;
    if (!programs) {
      programs = new Map();
      materialPros.programs = programs;
    }

    let pro = programs.get(programCacheKey);
    if (!pro) {
      const parameters = this.getParameters(
        mat,
        obj,
        scene,
        this.renderState.state.lights.state,
        this.clipping
      );
      pro = this.createProgram(mat, parameters);
      programs.set(programCacheKey, pro);
    }
    return pro;
  }

  getParameters(
    material: Material,
    obj: Object3D,
    scn: Scene,
    lights: any,
    clipping: WebGLClipping
  ) {
    // const geometry = obj.geometry;
    const HAS_AOMAP = !!material.aoMap;
    return {
      shaderID: material.type,
      vertexColors: material.vertexColors,
      numDirLights: lights.directional.length,
      numPointLights: lights.point.length,
      numSpotLights: lights.spot.length,
      numSpotLightMaps: lights.spotLightMap.length,
      numRectAreaLights: lights.rectArea.length,
      numHemiLights: lights.hemi.length,
      numDirLightShadows: lights.directionalShadowMap.length,
      numPointLightShadows: lights.pointShadowMap.length,
      numSpotLightShadows: lights.spotShadowMap.length,
      numSpotLightShadowsWithMaps: lights.numSpotLightShadowsWithMaps,
      numClippingPlanes: clipping.numPlanes,
      numClipIntersection: clipping.numIntersection,
      outputColorSpace: "srgb",
    };
  }
  getProgramCacheKey(material: Material) {
    const color = material.color;
    const opacity = material.opacity;
    return `color: ${color}; opacity: ${opacity}`;
  }

  createProgram(material: Material, parameters: any) {
    return new WebGLProgram_w(material, parameters, this.gl);
  }
}
