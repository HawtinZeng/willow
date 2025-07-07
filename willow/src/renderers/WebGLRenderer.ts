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
import {
  Float32BufferAttribute,
  Int16BufferAttribute,
} from "../core/BufferAttribute";

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

    this.renderer.setMode(this.gl.TRIANGLES);

    this.compile(scene);

    this.renderObjects(scene, camera);
  }
  renderObjects(scene: Scene, camera: Camera) {
    scene.updateMatrixWorld();
    camera.updateMatrixWorld();
    scene.children.forEach((item: any) => {
      if (item.isMesh) {
        this.renderObject(item, camera, scene);
      }
    });
  }

  compile(scene: Scene) {
    const state = this.renderState;
    scene.traverseVisible(function (object: any) {
      if (object.isLight) {
        state.pushLight(object);

        if (object.castShadow) {
          state.pushShadow(object);
        }
      }
    });
    state.setupLights();

    scene.traverse((object: any) => {
      if (
        !(object.isMesh || object.isPoints || object.isLine || object.isSprite)
      ) {
        return;
      }

      object.geometry.attributes.position = new Float32BufferAttribute(
        [-1, -1, 1, 1, 1, 1, 1, -1, 1, -1, 1, 1],
        3
      );
      const indexArray = [0, 1, 2, 0, 3, 1];

      object.geometry.index = new Int16BufferAttribute(indexArray, 1);

      const material = object.material;
      if (material) {
        this.getProgram(scene, material, object);
      }
    });
  }

  prepareObjUniforms(obj: Object3D) {
    const p_uniforms = (
      this.state.currentProgram as any as WebGLProgram_w
    ).getUniforms();

    p_uniforms.setValue(this.gl, "modelViewMatrix", obj.modelViewMatrix);
    p_uniforms.setValue(this.gl, "modelMatrix", obj.matrixWorld);
  }

  prepareUniforms(mat: Material, ca: Camera) {
    const materialPros = WebGLRenderer.properties.get(mat);

    WebGLUniforms.upload(
      this.gl,
      this.getUniformList(materialPros),
      materialPros.uniforms
    );

    const p_uniforms = (
      this.state.currentProgram as any as WebGLProgram_w
    ).getUniforms();

    p_uniforms.setValue(this.gl, "projectionMatrix", ca.projectionMatrix);
    p_uniforms.setValue(this.gl, "viewMatrix", ca.matrixWorldInverse);
    p_uniforms.setValue(this.gl, "cameraPosition", ca.matrixWorld);
    p_uniforms.setValue(this.gl, "isOrthographic", ca.isOrthographicCamera);
  }
  renderObject(object: Mesh, camera: Camera, scene: Scene) {
    const geo = object.geometry;
    const mat = object.material;

    camera.updateProjectionMatrix();

    object.modelViewMatrix.multiplyMatrices(
      camera.matrixWorldInverse,
      object.matrixWorld
    );

    const program = this.getProgram(scene, mat, object);

    this.state.useProgram(program);
    this.prepareObjUniforms(object);
    this.prepareUniforms(mat, camera);

    const context = this.gl;
    const offset = 0;
    this.objects.update(object);
    this.bindingStates.setup(object, mat, program, geo, geo.index);

    createFramebuffer(this.gl, 100, 100);
    this.renderer.renderIndex(
      object.geometry.index.count,
      offset,
      context.UNSIGNED_SHORT,
      2
    );
    this.readFromContext();
    // context.drawElements(context.TRIANGLES, 6, context.UNSIGNED_SHORT, 0);
    //   // for debug...

    // const frontFaceCW = true;
    // this.state.setMaterial(mat, frontFaceCW);
    // this.objects.update(object);
    // this.bindingStates.setup(object, mat, program, geo, geo.index);

    // this.renderer.setMode(this.gl.TRIANGLES);
    // const { drawRange } = geo;
    // let drawStart = drawRange.start;
    // let drawEnd = drawRange.start + drawRange.count;
    // if (geo.index) {
    //   drawStart = Math.max(drawStart, 0);
    //   drawEnd = Math.min(drawEnd, geo.index.count);
    //   const indexBufferInfo = this.attributes.get(geo.index);
    //   const context = this.gl;

    //   this.renderer.renderIndex(
    //     drawEnd - drawStart,
    //     drawStart,
    //     indexBufferInfo.type,
    //     indexBufferInfo.bytesPerElement
    //   );
    // }
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

  getProgram(scene: Scene, mat: Material, obj: Object3D) {
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

      const uniforms = UniformsUtils.clone(shader.uniforms) as any;
      this.materials.refreshMaterialUniforms(uniforms, mat); // from mat to uniforms

      // wire up the material to this renderer's lighting state
      const lights = this.renderState.state.lights;
      uniforms.ambientLightColor.value = lights.state.ambient;
      uniforms.lightProbe.value = lights.state.probe;

      uniforms.directionalLights.value = lights.state.directional;
      uniforms.directionalLightShadows.value = lights.state.directionalShadow;
      uniforms.spotLights.value = lights.state.spot;
      uniforms.spotLightShadows.value = lights.state.spotShadow;
      uniforms.rectAreaLights.value = lights.state.rectArea;
      uniforms.ltc_1.value = lights.state.rectAreaLTC1;
      uniforms.ltc_2.value = lights.state.rectAreaLTC2;
      uniforms.pointLights.value = lights.state.point;
      uniforms.pointLightShadows.value = lights.state.pointShadow;
      uniforms.hemisphereLights.value = lights.state.hemi;

      uniforms.directionalShadowMap.value = lights.state.directionalShadowMap;
      uniforms.directionalShadowMatrix.value =
        lights.state.directionalShadowMatrix;
      uniforms.spotShadowMap.value = lights.state.spotShadowMap;
      uniforms.spotLightMatrix.value = lights.state.spotLightMatrix;
      uniforms.spotLightMap.value = lights.state.spotLightMap;
      uniforms.pointShadowMap.value = lights.state.pointShadowMap;
      uniforms.pointShadowMatrix.value = lights.state.pointShadowMatrix;

      materialPros.uniforms = uniforms;
    }

    // FOR DEBUG
    // console.log(uniforms);
    // console.log(pro.vertexGlsl);
    // console.log(pro.fragmentGlsl);

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

  readFromContext() {
    const context = this.gl;
    const result = new Float32Array(100 * 100 * 4);
    context.readPixels(0, 0, 100, 100, context.RGBA, context.FLOAT, result);
    console.log(result);
  }
}

function createFramebuffer(
  context: WebGL2RenderingContext,
  width: number,
  height: number
) {
  const framebufferTexture = context.createTexture();
  context.bindTexture(context.TEXTURE_2D, framebufferTexture);
  context.texImage2D(
    context.TEXTURE_2D,
    0,
    context.RGBA32F,
    width,
    height,
    0,
    context.RGBA,
    context.FLOAT,
    null
  );

  const framebuffer = context.createFramebuffer();
  context.bindFramebuffer(context.FRAMEBUFFER, framebuffer);
  context.framebufferTexture2D(
    context.FRAMEBUFFER,
    context.COLOR_ATTACHMENT0,
    context.TEXTURE_2D,
    framebufferTexture,
    0
  );
}
