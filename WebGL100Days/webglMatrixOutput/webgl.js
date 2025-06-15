import { addMatrixWebGl } from "./mat-webgl.js";

function assertMat(a, b) {
  for (const i in a) {
    if (a[i] !== b[i]) throw new Error("assertion failed. Arrays not equal");
  }
  console.log(`Passed!`, a, b);
}

{
  const result = await addMatrixWebGl(
    { shape: [5, 2], data: new Float32Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]) },
    { shape: [5, 2], data: new Float32Array([2, 1, 1, 1, 1, 1, 1, 1, 1, 1]) }
  );
  console.log(result.data);
  // assertMat(result.data, mat2ResultF32);
}
