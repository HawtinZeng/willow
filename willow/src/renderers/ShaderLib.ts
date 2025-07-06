import { Color } from "../math/Color";
import { fragment, vertex } from "./shaders/ShaderLib/meshlambert.glsl";
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
    vertex: vertex,
    //     vertex: `
    // #define LAMBERT

    // varying vec3 vViewPosition;

    // #include <common>
    // #include <batching_pars_vertex>
    // #include <uv_pars_vertex>
    // #include <displacementmap_pars_vertex>
    // #include <envmap_pars_vertex>
    // #include <color_pars_vertex>
    // #include <fog_pars_vertex>
    // #include <normal_pars_vertex>
    // #include <morphtarget_pars_vertex>
    // #include <skinning_pars_vertex>
    // #include <shadowmap_pars_vertex>
    // #include <logdepthbuf_pars_vertex>
    // #include <clipping_planes_pars_vertex>

    // void main() {
    // 	#include <uv_vertex>
    // 	#include <color_vertex>
    // 	#include <morphinstance_vertex>
    // 	#include <morphcolor_vertex>
    // 	#include <batching_vertex>

    // 	#include <beginnormal_vertex>
    // 	#include <morphnormal_vertex>
    // 	#include <skinbase_vertex>
    // 	#include <skinnormal_vertex>
    // 	#include <defaultnormal_vertex>
    // 	#include <normal_vertex>
    // 	#include <begin_vertex>
    // 	#include <morphtarget_vertex>
    // 	#include <skinning_vertex>
    // 	#include <displacementmap_vertex>
    // 	#include <project_vertex>
    // 	#include <logdepthbuf_vertex>
    // 	#include <clipping_planes_vertex>

    // 	vViewPosition = - mvPosition.xyz;

    // 	#include <worldpos_vertex>
    // 	#include <envmap_vertex>
    // 	#include <shadowmap_vertex>
    // 	#include <fog_vertex>

    //   gl_Position = vec4(position, 1.0);
    // }
    // `,
    fragment: fragment,
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
