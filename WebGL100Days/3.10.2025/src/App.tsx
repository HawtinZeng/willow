import { useCallback } from "react";
import "./App.css";
import {
  BoxGeometry,
  Scene,
  Mesh,
  WebGLRenderer,
  OrthographicCamera,
  MeshLambertMaterial,
  DirectionalLight,
} from "willow";

function App() {
  const containerRef = useCallback((cvs: any) => {
    if (cvs) {
      const geo = new BoxGeometry(10, 10, 10);
      const material = new MeshLambertMaterial("#ff0000");
      const mesh = new Mesh(material, geo);

      const scene = new Scene();
      scene.add(mesh);

      const renderer = new WebGLRenderer(cvs);
      const camera = new OrthographicCamera();
      // For log glsl varable

      camera.rotateY(30);
      camera.rotateX(90);
      // camera.rotateZ(90);
      // camera.translateZ(3);

      const light1 = new DirectionalLight(0xff0000, 0.3);
      light1.position.set(3, 3, 3);
      scene.add(light1);

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
