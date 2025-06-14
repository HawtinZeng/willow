function WebGLBufferRenderer(gl, extensions, info) {
  let mode;

  function setMode(value) {
    mode = value;
  }

  function render(start, count) {
    gl.drawArrays(mode, start, count);

    info.update(count, mode, 1);
  }

  function renderIndex(count, start, type, bytesPerElement) {
    gl.drawElements(mode, count, type, start * bytesPerElement);
  }

  function renderInstances(start, count, primcount) {
    if (primcount === 0) return;

    gl.drawArraysInstanced(mode, start, count, primcount);

    info.update(count, mode, primcount);
  }

  function renderMultiDraw(starts, counts, drawCount) {
    if (drawCount === 0) return;

    const extension = extensions.get("WEBGL_multi_draw");
    extension.multiDrawArraysWEBGL(mode, starts, 0, counts, 0, drawCount);

    let elementCount = 0;
    for (let i = 0; i < drawCount; i++) {
      elementCount += counts[i];
    }

    info.update(elementCount, mode, 1);
  }

  function renderMultiDrawInstances(starts, counts, drawCount, primcount) {
    if (drawCount === 0) return;

    const extension = extensions.get("WEBGL_multi_draw");

    if (extension === null) {
      for (let i = 0; i < starts.length; i++) {
        renderInstances(starts[i], counts[i], primcount[i]);
      }
    } else {
      extension.multiDrawArraysInstancedWEBGL(
        mode,
        starts,
        0,
        counts,
        0,
        primcount,
        0,
        drawCount
      );

      let elementCount = 0;
      for (let i = 0; i < drawCount; i++) {
        elementCount += counts[i] * primcount[i];
      }

      info.update(elementCount, mode, 1);
    }
  }

  return {
    setMode,
    render,
    renderIndex,
    renderInstances,
    renderMultiDraw,
    renderMultiDrawInstances,
  };
}

export { WebGLBufferRenderer };
