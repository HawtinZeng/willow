import pkg from "./package.json" with { type: "json" };
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import copy from 'rollup-plugin-copy'
import path from 'path';
import { dirname } from 'path'

function watchAdditional(filePath) {
  return {
      name: 'watchAdditionalitional',
      buildStart() {
          filePath.forEach(p => {
            console.log(path.resolve(dirname('.'), p))
            this.addWatchFile(path.resolve(dirname('.'), p))
          })
      },
  };
}
export default [
  {
    input: "src/index.ts",
    output: [{ file: `dist/${pkg.module}`, format: "es" }],
    plugins: [
      watchAdditional([
        './package.json',
      ]),
      json(), 
      typescript({ tsconfig: './tsconfig.json' }),
      copy({
        targets: [
          { src: './package.json', dest: 'dist/' },
        ]
    }),
    
  ],
  },
];
