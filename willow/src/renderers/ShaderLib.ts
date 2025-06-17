import { Color } from "../math/Color";
import { UniformsLib } from "./UniformsLib";
import { mergeUniforms } from "./UniformsUtils";

export enum MaterialType {
  MeshLambertMaterial = "MeshLambertMaterial",
}
export type ShaderInfo = {
  vertex: string;
  fragment: string;
  uniforms: any;
};

export const ShaderLib: { [key in MaterialType]: ShaderInfo } = {
  [MaterialType.MeshLambertMaterial]: {
    vertex: `#version 300 es
		precision highp float;
		in vec3 aPosition;
		in vec2 aUV;

		out vec2 uv;

		void main(){
			gl_Position = vec4(aPosition, 1.0);
			uv = aUV;
		}
`,
    fragment: `#version 300 es
		precision highp float;
		uniform sampler2D samplerA;
		uniform sampler2D samplerB;

		in vec2 uv;

		out vec4 glColor;

		void main(){
			glColor = vec4(1, 0.0, 0.0, 1.0);
		}
`,
    uniforms: mergeUniforms([
      UniformsLib.common,
      UniformsLib.specularmap,
      UniformsLib.envmap,
      UniformsLib.aomap,
      UniformsLib.lightmap,
      UniformsLib.emissivemap,
      UniformsLib.bumpmap,
      UniformsLib.normalmap,
      UniformsLib.displacementmap,
      UniformsLib.fog,
      UniformsLib.lights,
      {
        emissive: { value: new Color(0x000000) },
      },
    ]),
  },
};
