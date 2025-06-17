import { useCallback } from "react";
import "./App.css";
import {
  BoxGeometry,
  Scene,
  Mesh,
  WebGLRenderer,
  OrthographicCamera,
  MeshLambertMaterial,
} from "willow";

function App() {
  const containerRef = useCallback((cvs: any) => {
    if (cvs) {
      const geo = new BoxGeometry(1, 1, 1);
      const material = new MeshLambertMaterial("#ff0000");
      const mesh = new Mesh(material, geo);
      mesh.translateX(10);

      const scene = new Scene();
      scene.add(mesh);

      const renderer = new WebGLRenderer(cvs);
      const camera = new OrthographicCamera();

      renderer.render(scene, camera);
    }
  }, []);
  return (
    <>
      <h3>Plaster scene</h3>
      <canvas
        style={{ border: "2px solid rgb(60, 60, 60)" }}
        height={700}
        width={700}
        ref={containerRef}
      />
    </>
  );
}

export default App;
