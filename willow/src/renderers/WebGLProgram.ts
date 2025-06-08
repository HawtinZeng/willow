import { LinearTransfer, SRGBTransfer } from "../constants";
import { Material } from "../materials/Basematerial";
import { ColorManagement } from "../math/ColorManagement";
import { Matrix3 } from "../math/Matrix3";
import { Vector3 } from "../math/Vector3";
import { fragmentExample } from "./fragment.gl";
import { ShaderLib } from "./ShaderLib";
import { ShaderChunk } from "./shaders/ShaderChunk";
import { vertexExample } from "./vertext.gl";
import { WebGLUniforms } from "./WebGLUniforms";
const includePattern = /^[ \t]*#include +<([\w\d./]+)>/gm;
let programIdCount = 0;
function includeReplacer(match: RegExp, include: string) {
  let string = (ShaderChunk as any)[include];

  if (string === undefined) {
    throw new Error("Can not resolve #include <" + include + ">");
  }

  return resolveIncludes(string);
}

const _m0 = new Matrix3();
function getEncodingComponents(colorSpace: any) {
  // @ts-ignore
  ColorManagement._getMatrix(
    _m0,
    ColorManagement.workingColorSpace,
    colorSpace
  );

  const encodingMatrix = `mat3( ${_m0.elements.map((v) => v.toFixed(4))} )`;

  switch (ColorManagement.getTransfer(colorSpace)) {
    case LinearTransfer:
      return [encodingMatrix, "LinearTransferOETF"];

    case SRGBTransfer:
      return [encodingMatrix, "sRGBTransferOETF"];

    default:
      console.warn("THREE.WebGLProgram: Unsupported color space: ", colorSpace);
      return [encodingMatrix, "LinearTransferOETF"];
  }
}
function getTexelEncodingFunction(functionName: any, colorSpace: any) {
  const components = getEncodingComponents(colorSpace);

  return [
    `vec4 ${functionName}( vec4 value ) {`,

    `	return ${components[1]}( vec4( value.rgb * ${components[0]}, value.a ) );`,

    "}",
  ].join("\n");
}

const _v0 = new Vector3();
function getLuminanceFunction() {
  // @ts-ignore
  ColorManagement.getLuminanceCoefficients(_v0);
  const r = _v0.x.toFixed(4);
  const g = _v0.y.toFixed(4);
  const b = _v0.z.toFixed(4);

  return [
    "float luminance( const in vec3 rgb ) {",

    `	const vec3 weights = vec3( ${r}, ${g}, ${b} );`,

    "	return dot( weights, rgb );",

    "}",
  ].join("\n");
}
function replaceLightNums(string: any, parameters: any) {
  const numSpotLightCoords =
    parameters.numSpotLightShadows +
    parameters.numSpotLightMaps -
    parameters.numSpotLightShadowsWithMaps;

  return string
    .replace(/NUM_DIR_LIGHTS/g, parameters.numDirLights)
    .replace(/NUM_SPOT_LIGHTS/g, parameters.numSpotLights)
    .replace(/NUM_SPOT_LIGHT_MAPS/g, parameters.numSpotLightMaps)
    .replace(/NUM_SPOT_LIGHT_COORDS/g, numSpotLightCoords)
    .replace(/NUM_RECT_AREA_LIGHTS/g, parameters.numRectAreaLights)
    .replace(/NUM_POINT_LIGHTS/g, parameters.numPointLights)
    .replace(/NUM_HEMI_LIGHTS/g, parameters.numHemiLights)
    .replace(/NUM_DIR_LIGHT_SHADOWS/g, parameters.numDirLightShadows)
    .replace(
      /NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,
      parameters.numSpotLightShadowsWithMaps
    )
    .replace(/NUM_SPOT_LIGHT_SHADOWS/g, parameters.numSpotLightShadows)
    .replace(/NUM_POINT_LIGHT_SHADOWS/g, parameters.numPointLightShadows);
}

function replaceClippingPlaneNums(string: any, parameters: any) {
  return string
    .replace(/NUM_CLIPPING_PLANES/g, parameters.numClippingPlanes)
    .replace(
      /UNION_CLIPPING_PLANES/g,
      parameters.numClippingPlanes - parameters.numClipIntersection
    );
}

function resolveIncludes(string: string) {
  return string.replace(includePattern, includeReplacer as any);
}

function fetchAttributeLocations(gl: any, program: any) {
  const attributes: any = {};

  const n = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

  for (let i = 0; i < n; i++) {
    const info = gl.getActiveAttrib(program, i);
    const name = info.name;

    let locationSize = 1;
    if (info.type === gl.FLOAT_MAT2) locationSize = 2;
    if (info.type === gl.FLOAT_MAT3) locationSize = 3;
    if (info.type === gl.FLOAT_MAT4) locationSize = 4;

    // console.log( 'THREE.WebGLProgram: ACTIVE VERTEX ATTRIBUTE:', name, i );

    attributes[name] = {
      type: info.type,
      location: gl.getAttribLocation(program, name),
      locationSize: locationSize,
    };
  }

  return attributes;
}

const unrollLoopPattern =
  /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function unrollLoops(string: any) {
  return string.replace(unrollLoopPattern, loopReplacer);
}

function loopReplacer(match: any, start: any, end: any, snippet: any) {
  let string = "";

  for (let i = parseInt(start); i < parseInt(end); i++) {
    string += snippet
      .replace(/\[\s*i\s*\]/g, "[ " + i + " ]")
      .replace(/UNROLLED_LOOP_INDEX/g, i);
  }

  return string;
}

function createWebGLShader(
  gl: WebGLRenderingContext,
  type: GLenum,
  string: string
) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, string);
  gl.compileShader(shader);

  return shader;
}

function handleSource(string: any, errorLine: any) {
  const lines = string.split("\n");
  const lines2 = [];

  const from = Math.max(errorLine - 6, 0);
  const to = Math.min(errorLine + 6, lines.length);

  for (let i = from; i < to; i++) {
    const line = i + 1;
    lines2.push(`${line === errorLine ? ">" : " "} ${line}: ${lines[i]}`);
  }

  return lines2.join("\n");
}

function getShaderErrors(gl: any, shader: any, type: any) {
  const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  const errors = gl.getShaderInfoLog(shader).trim();

  if (status && errors === "") return "";

  const errorMatches = /ERROR: 0:(\d+)/.exec(errors);
  if (errorMatches) {
    // --enable-privileged-webgl-extension
    // console.log( '**' + type + '**', gl.getExtension( 'WEBGL_debug_shaders' ).getTranslatedShaderSource( shader ) );

    const errorLine = parseInt(errorMatches[1]);
    return (
      type.toUpperCase() +
      "\n\n" +
      errors +
      "\n\n" +
      handleSource(gl.getShaderSource(shader), errorLine)
    );
  } else {
    return errors;
  }
}

export class WebGLProgram {
  checkShaderErrors: boolean = true;
  diagnostics: any = {};
  cachedUniforms: any;
  cachedAttributes: any;
  type: any;
  name: any;
  id: number;
  usedTimes: number;
  program: globalThis.WebGLProgram;
  vertexShader: WebGLShader;
  fragmentShader: WebGLShader;

  constructor(
    public material: Material,
    public parameters: any,
    public gl: WebGLRenderingContext,
    public cacheKey: string
  ) {
    const shaderName = material.type;
    let vertexShader = ShaderLib[material.type].vertex;
    vertexShader = resolveIncludes(vertexShader);
    vertexShader = replaceLightNums(vertexShader, parameters);
    vertexShader = replaceClippingPlaneNums(vertexShader, parameters);
    vertexShader = unrollLoops(vertexShader);

    let fragmentShader = ShaderLib[material.type].fragment;
    fragmentShader = resolveIncludes(fragmentShader);
    fragmentShader = replaceLightNums(fragmentShader, parameters);
    fragmentShader = replaceClippingPlaneNums(fragmentShader, parameters);
    fragmentShader = unrollLoops(fragmentShader);

    const program = gl.createProgram();
    const prefixVertex = [
      `#version 300 es
    #define attribute in
    #define varying out
    #define texture2D texture
    precision highp float;
    precision highp int;
    precision highp sampler2D;
    precision highp samplerCube;
    precision highp sampler3D;
    precision highp sampler2DArray;
    precision highp sampler2DShadow;
    precision highp samplerCubeShadow;
    precision highp sampler2DArrayShadow;
    precision highp isampler2D;
    precision highp isampler3D;
    precision highp isamplerCube;
    precision highp isampler2DArray;
    precision highp usampler2D;
    precision highp usampler3D;
    precision highp usamplerCube;
    precision highp usampler2DArray;
    #define HIGH_PRECISION`,
      "uniform mat4 modelMatrix;",
      "uniform mat4 modelViewMatrix;",
      "uniform mat4 projectionMatrix;",
      "uniform mat4 viewMatrix;",
      "uniform mat3 normalMatrix;",
      "uniform vec3 cameraPosition;",
      "uniform bool isOrthographic;",
      "attribute vec3 position;",
      "attribute vec3 normal;",
      "attribute vec2 uv;",
    ].join("\n");

    const prefixFragment = [
      `#version 300 es
    #define varying in
    layout(location = 0) out highp vec4 pc_fragColor;
    #define gl_FragColor pc_fragColor
    precision highp float;
    precision highp int;
    precision highp sampler2D;
    precision highp samplerCube;
    precision highp sampler3D;
    precision highp sampler2DArray;
    precision highp sampler2DShadow;
    precision highp samplerCubeShadow;
    precision highp sampler2DArrayShadow;
    precision highp isampler2D;
    precision highp isampler3D;
    precision highp isamplerCube;
    precision highp isampler2DArray;
    precision highp usampler2D;
    precision highp usampler3D;
    precision highp usamplerCube;
    precision highp usampler2DArray;
    #define HIGH_PRECISION`,
      "uniform mat4 viewMatrix;",
      "uniform vec3 cameraPosition;",
      "uniform bool isOrthographic;",
      ShaderChunk["colorspace_pars_fragment"],
      getTexelEncodingFunction(
        "linearToOutputTexel",
        parameters.outputColorSpace
      ),
      getLuminanceFunction(),
    ].join("\n");

    const vertexGlsl = prefixVertex + vertexShader;
    const fragmentGlsl = prefixFragment + fragmentShader;
    const glVertexShader = createWebGLShader(
      this.gl,
      this.gl.VERTEX_SHADER,
      vertexGlsl
    );
    const glFragmentShader = createWebGLShader(
      this.gl,
      this.gl.FRAGMENT_SHADER,
      fragmentGlsl
    );

    gl.attachShader(program, glVertexShader);
    gl.attachShader(program, glFragmentShader);

    gl.linkProgram(program);
    this.onFirstUse(shaderName, program, glVertexShader, glFragmentShader);

    this.type = parameters.shaderType;
    this.name = parameters.shaderName;
    this.id = programIdCount++;
    this.usedTimes = 1;
    this.program = program;
    this.vertexShader = glVertexShader;
    this.fragmentShader = glFragmentShader;
  }
  onFirstUse(
    shaderName: string,
    program: globalThis.WebGLProgram,
    glVertexShader: WebGLShader,
    glFragmentShader: WebGLShader
  ) {
    // check for link errors
    if (this.checkShaderErrors) {
      const gl = this.gl;
      const programLog = gl.getProgramInfoLog(program);
      const vertexLog = gl.getShaderInfoLog(glVertexShader);
      const fragmentLog = gl.getShaderInfoLog(glFragmentShader);

      let runnable = true;
      let haveDiagnostics = true;

      if (gl.getProgramParameter(program, gl.LINK_STATUS) === false) {
        runnable = false;
        // default error reporting
        const vertexErrors = getShaderErrors(gl, glVertexShader, "vertex");
        const fragmentErrors = getShaderErrors(
          gl,
          glFragmentShader,
          "fragment"
        );

        console.error(
          "THREE.WebGLProgram: Shader Error " +
            gl.getError() +
            " - " +
            "VALIDATE_STATUS " +
            gl.getProgramParameter(program, gl.VALIDATE_STATUS) +
            "\n\n" +
            "Material Name: " +
            shaderName +
            "\n\n" +
            "Program Info Log: " +
            programLog +
            "\n" +
            vertexErrors +
            "\n" +
            fragmentErrors
        );
      } else if (programLog !== "") {
        console.warn("THREE.WebGLProgram: Program Info Log:", programLog);
      } else if (vertexLog === "" || fragmentLog === "") {
        haveDiagnostics = false;
      }
      if (haveDiagnostics) {
        this.diagnostics = {
          runnable: runnable,
          programLog: programLog,
          vertexShader: {
            log: vertexLog,
          },
          fragmentShader: {
            log: fragmentLog,
          },
        };
      }
    }

    // pass data to
    this.cachedUniforms = new WebGLUniforms(this.gl, program);
    this.cachedAttributes = fetchAttributeLocations(this.gl, program);
  }
}
