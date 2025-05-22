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
window.Learn_webgl_model_render_40 = function (gl, select_program,
                                               visible_program, model, out) {

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

  var model_selection_color = null;
  var model_color = null;

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
    select_program.u_Color_location     = gl.getUniformLocation(select_program, 'u_Color');
    select_program.u_Transform_location = gl.getUniformLocation(select_program, 'u_Transform');
    select_program.a_Vertex_location    = gl.getAttribLocation(select_program,  'a_Vertex');

    visible_program.u_PVM_transform = gl.getUniformLocation(visible_program, "u_PVM_transform");
    visible_program.u_VM_transform = gl.getUniformLocation(visible_program, "u_VM_transform");

    visible_program.u_Light_position = gl.getUniformLocation(visible_program, "u_Light_position");
    visible_program.u_Light_color = gl.getUniformLocation(visible_program, "u_Light_color");
    visible_program.u_Ambient_color = gl.getUniformLocation(visible_program, "u_Ambient_color");
    visible_program.u_Shininess = gl.getUniformLocation(visible_program, "u_Shininess");

    visible_program.a_Vertex = gl.getAttribLocation(visible_program, 'a_Vertex');
    visible_program.a_Color = gl.getAttribLocation(visible_program, 'a_Color');
    visible_program.a_Vertex_normal = gl.getAttribLocation(visible_program, 'a_Vertex_normal');

    visible_program.u_Model_color = gl.getUniformLocation(visible_program, "u_Model_color");
  }

  //-----------------------------------------------------------------------
  // These one-time tasks set up the rendering of the models.
  _buildBufferObjects();
  _getLocationOfShaderVariables();

  //-----------------------------------------------------------------------
  /**
   * Set the model's ID for selection.
   * @param id Array An RGBA array used for the object's selection ID
   */
  self.setID = function (id) {
    model_selection_color = id;
  };

  //-----------------------------------------------------------------------
  /**
   * The the model's ID for selection.
   * @param id Array An RGBA array used for the object's selection ID
   */
  self.setColor = function (color) {
    model_color = color;
  };

  //-----------------------------------------------------------------------
  /**
   * Delete the Buffer Objects associated with this model.
   * @param gl Object The WebGL state and API.
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
    // Build the buffers for the points
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
    if (number_triangles > 0) {
      // Activate the model's triangle vertex object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, triangles_vertex_buffer_id);

      // Bind the vertices VOB to the 'a_Vertex' shader variable
      //var stride = self.vertices3[0].BYTES_PER_ELEMENT*3;
      gl.vertexAttribPointer(visible_program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(visible_program.a_Vertex);

      // Activate the model's triangle color object buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, triangles_color_buffer_id);

      // Bind the colors VOB to the 'a_Color' shader variable
      gl.vertexAttribPointer(visible_program.a_Color, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(visible_program.a_Color);

      // Activate the model's triangle normal vector object buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, triangles_smooth_normal_buffer_id);

      // Bind the normal vectors VOB to the 'a_Normal' shader variable
      gl.vertexAttribPointer(visible_program.a_Vertex_normal, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(visible_program.a_Vertex_normal);

      // Draw all of the triangles
      gl.drawArrays(gl.TRIANGLES, 0, number_triangles * 3);
    }
  }

  //-----------------------------------------------------------------------
  /**
   * Render the model.
   * @param gl Object The WebGL state and API.
   * @param transform 4x4Matrix The transformation to apply to the model vertices.
   */
  self.render = function (pvm_transform, vm_transform) {

    if (gl.getParameter(gl.CURRENT_PROGRAM) == select_program) {
      // Set the transform for all the triangle vertices
      gl.uniformMatrix4fv(select_program.u_Transform_location, false, pvm_transform);

      // Set the color for all of the triangle faces
      gl.uniform4fv(select_program.u_Color_location, model_selection_color);

      // Activate the model's vertex Buffer Object
      gl.bindBuffer(gl.ARRAY_BUFFER, triangles_vertex_buffer_id);

      // Bind the vertices Buffer Object to the 'a_Vertex' shader variable
      gl.vertexAttribPointer(select_program.a_Vertex_location, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(select_program.a_Vertex_location);

      // Draw all of the triangles
      gl.drawArrays(gl.TRIANGLES, 0, number_triangles * 3);
    } else if (gl.getParameter(gl.CURRENT_PROGRAM) == visible_program){
      // Set the transform for all the faces, lines, and points
      gl.uniformMatrix4fv(visible_program.u_PVM_transform, false, pvm_transform);
      gl.uniformMatrix4fv(visible_program.u_VM_transform, false, vm_transform);
      gl.uniform3fv(visible_program.u_Model_color, model_color);

      _renderTriangles();
    }
  };

};
