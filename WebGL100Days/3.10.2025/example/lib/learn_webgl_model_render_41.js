/**
 * simple_model_render_40.js, By Wayne Brown, Fall 2015
 */

/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 C. Wayne Brown
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use strict";

//-------------------------------------------------------------------------
/**
 * Given a model description, create the buffer objects needed to render
 * the model. This is very closely tied to the shader implementations.
 * @param gl Object The WebGL state and API
 * @param select_program Object The shader program the will render the model for selection.
 * @param visible_program Object The shader program the will render the model for selection.
 * @param model Simple_model The model data.
 * @param out Object Can display messages to the webpage.
 * @constructor
 */
window.Learn_webgl_model_render_41 = function (gl, program, model, out) {

  var self = this;

  // Variables to remember so the model can be rendered.
  var number_triangles = 0;
  var triangles_vertex_buffer_id = null;
  var triangles_color_buffer_id = null;
  var triangles_normal_buffer_id = null;
  var triangles_smooth_normal_buffer_id = null;

  var number_lines = 0;
  var lines_vertex_buffer_id = null;
  var lines_color_buffer_id = null;

  var number_points = 0;
  var points_vertex_buffer_id = null;
  var points_color_buffer_id = null;

  var model_color = null;
  var contains_transparent_surfaces = false;

  // For sorting the vertices of a triangle
  var matrix = new window.Learn_webgl_matrix();
  var p4 = new window.Learn_webgl_point4();
  var one_vertex = p4.create();
  var transformed_vertex = p4.create();
  var sort_indexes = null;

  //-----------------------------------------------------------------------
  /**
   * Initialize the sort_indexes array for sorting the model's triangles.
   * This array is re-sorted before each render of a transparent model.
   * @private
   */
  function _initialize_sorting() {
    var j;

    if (number_triangles  > 0) {
      sort_indexes = new Array(number_triangles);
      for (j = 0; j < number_triangles; j += 1) {
        sort_indexes[j] = [j, 0.0];  // [index to triangle, distance from camera]
      }
    }
  }

  //-----------------------------------------------------------------------
  function _createBufferObject(data) {
    // Create a buffer object
    var buffer_id;

    buffer_id = gl.createBuffer();
    if (!buffer_id) {
      out.displayError('Failed to create the buffer object for ' + model.name);
      return null;
    }

    // Make the buffer object the active buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer_id);

    // Upload the data for this buffer object to the GPU.
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    return buffer_id;
  }

  //-----------------------------------------------------------------------
  /**
   * Create the buffer objects needed and upload the data to the GPU
   * @private
   */
  function _buildBufferObjects() {

    // Build the buffers for the triangles
    if (model.triangles !== null && model.triangles.vertices.length > 0) {
      number_triangles = model.triangles.vertices.length / 3 / 3;
      triangles_vertex_buffer_id = _createBufferObject(model.triangles.vertices);
      triangles_color_buffer_id = _createBufferObject(model.triangles.colors);
      triangles_normal_buffer_id = _createBufferObject(model.triangles.flat_normals);
      triangles_smooth_normal_buffer_id = _createBufferObject(model.triangles.smooth_normals);

      sort_indexes = new Array(number_triangles);
    }

    // Build the buffers for the lines
    if (model.lines !== null && model.lines.vertices.length > 0) {
      number_lines = model.lines.vertices.length / 3 / 2;
      lines_vertex_buffer_id = _createBufferObject(model.lines.vertices);
      lines_color_buffer_id = _createBufferObject(model.lines.colors);
    }

    // Build the buffers for the points
    if (model.points !== null && model.points.vertices.length > 0) {
      number_points = model.points.vertices.length / 3; // 3 components per vertex
      points_vertex_buffer_id = _createBufferObject(model.points.vertices);
      points_color_buffer_id = _createBufferObject(model.points.colors);
    }

  }

  //-----------------------------------------------------------------------
  /**
   * Get the location of the shader variables in the shader program.
   * @private
   */
  function _getLocationOfShaderVariables() {
    // Get the location of the shader variables
    program.u_PVM_transform = gl.getUniformLocation(program, "u_PVM_transform");
    program.u_VM_transform = gl.getUniformLocation(program, "u_VM_transform");

    program.u_Light_position = gl.getUniformLocation(program, "u_Light_position");
    program.u_Light_color = gl.getUniformLocation(program, "u_Light_color");
    program.u_Ambient_color = gl.getUniformLocation(program, "u_Ambient_color");
    program.u_Shininess = gl.getUniformLocation(program, "u_Shininess");

    program.a_Vertex = gl.getAttribLocation(program, 'a_Vertex');
    //visible_program.a_Color = gl.getAttribLocation(visible_program, 'a_Color');
    program.a_Vertex_normal = gl.getAttribLocation(program, 'a_Vertex_normal');

    program.u_Model_color = gl.getUniformLocation(program, "u_Model_color");
  }

  //-----------------------------------------------------------------------
  // These one-time tasks set up the rendering of the models.
  _buildBufferObjects();
  _getLocationOfShaderVariables();
  _initialize_sorting();

  //-----------------------------------------------------------------------
  /**
   * Set the model's uniform color.
   * @param color Array An RGBA array used for the object's selection ID
   */
  self.setColor = function (color) {
    model_color = color;
    if (color[3] !== 1.0) {
      contains_transparent_surfaces = true;
    }
  };

  //-----------------------------------------------------------------------
  /**
   * Delete the Buffer Objects associated with this model.
   */
  self.delete = function () {
    if (number_triangles > 0) {
      gl.deleteBuffer(triangles_vertex_buffer_id);
      gl.deleteBuffer(triangles_color_buffer_id);
      gl.deleteBuffer(triangles_normal_buffer_id);
      gl.deleteBuffer(triangles_smooth_normal_buffer_id);
    }
    if (number_lines > 0) {
      gl.deleteBuffer(lines_vertex_buffer_id);
      gl.deleteBuffer(lines_color_buffer_id);
    }
    if (number_points > 0) {
      gl.deleteBuffer(points_vertex_buffer_id);
      gl.deleteBuffer(points_color_buffer_id);
    }
  };

  //-----------------------------------------------------------------------
  /**
   * Render the triangles in the model.
   * @private
   */
  function _renderTriangles() {
    var j;

    if (number_triangles > 0) {
      // Activate the model's triangle vertex object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, triangles_vertex_buffer_id);

      // Bind the vertices VOB to the 'a_Vertex' shader variable
      //var stride = self.vertices3[0].BYTES_PER_ELEMENT*3;
      gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Vertex);

      // Activate the model's triangle color object buffer
      //gl.bindBuffer(gl.ARRAY_BUFFER, triangles_color_buffer_id);

      // Bind the colors VOB to the 'a_Color' shader variable
      //gl.vertexAttribPointer(visible_program.a_Color, 3, gl.FLOAT, false, 0, 0);
      //gl.enableVertexAttribArray(visible_program.a_Color);

      // Activate the model's triangle normal vector object buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, triangles_smooth_normal_buffer_id);

      // Bind the normal vectors VOB to the 'a_Normal' shader variable
      gl.vertexAttribPointer(program.a_Vertex_normal, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Vertex_normal);

      if (contains_transparent_surfaces) {
        // Draw all of the triangles in sorted order
        for (j = 0; j < number_triangles; j += 1) {
          gl.drawArrays(gl.TRIANGLES, sort_indexes[j][0] * 3, 3);
        }
      } else {
          gl.drawArrays(gl.TRIANGLES, 0, number_triangles * 3);
      }
    }
  }

  //-----------------------------------------------------------------------
  /**
   * Sort the triangles of a model, back to front, based on their distance
   * from the camera.
   * @param vm_transform Float32Array The transformation to apply to the model vertices.
   */
  function _sort_triangles (vm_transform) {
    var j, k, n, which_triangle, vertices, max_z, temp;

    // Step 1: Transform each vertex in a model by the current *ModelView* transformation.
    // Step 2: For each triangle, determine its maximum distance from the camera.
    vertices = model.triangles.vertices;
    for (j = 0; j < number_triangles; j += 1) {

      which_triangle = sort_indexes[j][0];
      k = which_triangle * 3 * 3;
      max_z = 10e10;
      for (n = 0; n < 3; n += 1, k += 3) {
        one_vertex[0] = vertices[k];
        one_vertex[1] = vertices[k + 1];
        one_vertex[2] = vertices[k + 2];
        matrix.multiply(transformed_vertex, vm_transform, one_vertex);

        if (transformed_vertex[2] < max_z) {
          max_z = transformed_vertex[2];
        }
      }

      // Remember this triangle's distance from the camera
      sort_indexes[j][1] = max_z;
    }

    // Step 3: Perform an insertion sort on the triangles, using the vertex
    // that is farthest from the camera as the sorting key.
    for (j = 0; j < number_triangles; j += 1) {
      temp = sort_indexes[j];
      k = j - 1;
      while (k >= 0 && sort_indexes[k][1] > temp[1]) {
        sort_indexes[k + 1] = sort_indexes[k];
        k -= 1;
      }
      sort_indexes[k + 1] = temp;
    }
  }

  //-----------------------------------------------------------------------
  /**
   * Render the model.
   * @param pvm_transform Float32Array The projection, view, model transform.
   * @param vm_transform Float32Array The view, model transform.
   */
  self.render = function (pvm_transform, vm_transform) {

    if (contains_transparent_surfaces) {
      _sort_triangles (vm_transform);
    }

    // Set the transform for all the faces, lines, and points
    gl.uniformMatrix4fv(program.u_PVM_transform, false, pvm_transform);
    gl.uniformMatrix4fv(program.u_VM_transform, false, vm_transform);
    gl.uniform4fv(program.u_Model_color, model_color);

    _renderTriangles();
  };

};
