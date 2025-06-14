import { WebGLProgram as WebGLProgram_w } from "./WebGLProgram";
import { Camera } from "../camera/camera";
import { Geometry } from "../geometry/Geometry";
import { Material } from "../materials/Basematerial";
import { Mesh } from "../objects/mesh";
import { Scene } from "../scene/scene";
import { WebGLProperties } from "./WebGLProperties";
import { WebGLClipping } from "./WebGLClipping";
import { WebGLExtensions } from "./WebGLExtensions";
import { WebGLState } from "./WebGLState";
import { WebGLRenderState } from "./WebGLRenderStates";
import { WebGLAttributes } from "./WebGLAttributes";
import { WebGLGeometries } from "./WebGLGeometries";
import { WebGLInfo } from "./WebGLInfo";
import { WebGLObjects } from "./WebGLObjects";
import { WebGLBindingStates } from "./WebGLBindingStates";
import { WebGLBufferRenderer } from "./WebGLBufferRenderer";
import { Object3D } from "../objects/Object3D";
import { ShaderLib } from "./ShaderLib";
import { UniformsUtils } from "./UniformsUtils";
import { WebGLUniforms } from "./WebGLUniforms";
import { WebGLMaterials } from "./WebGLMaterials";

export class WebGLRenderer {
  private currentState: any;
  private canvas: HTMLCanvasElement;
  private gl!: WebGL2RenderingContext;
  private static properties: WebGLProperties = new WebGLProperties();
  private clipping: WebGLClipping = new WebGLClipping();
  toneMappingExposure: number = 1.0;
  // @ts-ignore
  extensions: ReturnType<typeof WebGLExtensions>;
  // @ts-ignore
  state: ReturnType<typeof WebGLState>;
  // @ts-ignore
  renderState: ReturnType<typeof WebGLRenderState>;
  // @ts-ignore
  diagnostics: any;
  // @ts-ignore
  attributes: ReturnType<typeof WebGLAttributes>;
  // @ts-ignore
  info: ReturnType<typeof WebGLInfo>;
  // @ts-ignore
  geometries: ReturnType<typeof WebGLGeometries>;
  // @ts-ignore
  objects: ReturnType<typeof WebGLObjects>;
  // @ts-ignore
  bindingStates: ReturnType<typeof WebGLBindingStates>;

  // @ts-ignore
  renderer: ReturnType<typeof WebGLBufferRenderer>;

  // @ts-ignore
  materials: ReturnType<typeof WebGLMaterials>;

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
    this.extensions = (WebGLExtensions as any)(this.gl);
    this.extensions.init();
    this.state = (WebGLState as any)(this.gl, this.extensions);
    this.renderState = (WebGLRenderState as any)(this.extensions);
    this.renderState.init();
    this.attributes = WebGLAttributes(this.gl);
    this.bindingStates = WebGLBindingStates(this.gl, this.attributes);

    this.info = WebGLInfo(this.gl);
    this.geometries = WebGLGeometries(
      this.gl,
      this.attributes,
      this.info,
      this.bindingStates
    );
    this.objects = WebGLObjects(
      this.gl,
      this.geometries,
      this.attributes,
      this.info
    );

    this.materials = WebGLMaterials(this, WebGLRenderer.properties);
    this.renderer = WebGLBufferRenderer(this.gl, this.extensions, this.info);
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
  prepareUnifroms(mat: Material, ca: Camera) {
    const materialPros = WebGLRenderer.properties.get(mat);
    WebGLUniforms.upload(
      this.gl,
      this.getUniformList(materialPros),
      materialPros.uniforms
      // textures, TODO
    );

    const p_uniforms = (
      this.state.currentProgram as any as WebGLProgram_w
    ).getUniforms();

    p_uniforms.setValue(this.gl, "projectionMatrix", ca.projectionMatrix);
    p_uniforms.setValue(this.gl, "viewMatrix", ca.matrixWorldInverse);
    p_uniforms.setValue(this.gl, "cameraPosition", ca.matrixWorld);
    p_uniforms.setValue(this.gl, "isOrthographic", ca.isOrthographicCamera);
    p_uniforms.setValue(
      this.gl,
      "toneMappingExposure",
      this.toneMappingExposure
    );
  }
  renderObject(object: Mesh, camera: Camera, scene: Scene) {
    const geo = object.geometry;
    const mat = object.material;

    object.modelViewMatrix.multiplyMatrices(
      camera.matrixWorldInverse,
      object.matrixWorld
    );

    const program = this.getProgram(scene, geo, mat, object);

    this.state.useProgram(program);
    this.prepareUnifroms(mat, camera);

    const frontFaceCW = true;
    this.state.setMaterial(mat, frontFaceCW);
    this.bindingStates.setup(object, mat, program, geo, geo.index);

    this.objects.update(object);

    this.renderer.setMode(this.gl.TRIANGLES);
    const { drawRange } = geo;
    let drawStart = drawRange.start;
    let drawEnd = drawRange.start + drawRange.count;
    if (geo.index) {
      drawStart = Math.max(drawStart, 0);
      drawEnd = Math.min(drawEnd, geo.index.count);
      const indexBufferInfo = this.attributes.get(geo.index);
      this.renderer.renderIndex(
        drawEnd - drawStart,
        drawStart,
        indexBufferInfo.type,
        indexBufferInfo.bytesPerElement
      );
    }
  }

  getUniformList(materialProperties: any) {
    if (materialProperties.uniformsList === undefined) {
      const progUniforms = (
        this.state.currentProgram as any as WebGLProgram_w
      ).getUniforms();
      materialProperties.uniformsList = WebGLUniforms.seqWithValue(
        progUniforms.seq,
        materialProperties.uniforms
      );
    }

    return materialProperties.uniformsList;
  }

  getProgram(scene: Scene, geo: Geometry, mat: Material, obj: Object3D) {
    const programCacheKey = this.getProgramCacheKey(mat);

    const materialPros = WebGLRenderer.properties.get(mat);
    let programs = materialPros.programs;
    if (!programs) {
      programs = new Map();
      materialPros.programs = programs;
    }

    let pro = programs.get(programCacheKey) as WebGLProgram_w;
    if (!pro) {
      const parameters = this.getParameters(
        mat,
        obj,
        scene,
        this.renderState.state.lights.state,
        this.clipping
      );
      pro = this.createProgram(mat, parameters, programCacheKey);
      programs.set(programCacheKey, pro);

      const shader = ShaderLib[mat.type];
      const t_uniforms = UniformsUtils.clone(shader.uniforms);
      this.materials.refreshMaterialUniforms(t_uniforms, mat); // from mat to uniforms

      materialPros.uniforms = t_uniforms;
    }

    // FOR DEBUG
    // console.log(uniforms);
    console.log(pro.vertexGlsl);
    console.log(pro.fragmentGlsl);

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
    return `color: ${color}; opacity: ${opacity}; MaterialType: ${material.type}`;
  }

  createProgram(material: Material, parameters: any, programCacheKey: string) {
    return new WebGLProgram_w(material, parameters, this.gl, programCacheKey);
  }
}
