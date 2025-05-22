/**
 * learn_webgl_model_render_05.js, By Wayne Brown, Spring 2016
 *
 * Given
 *   - a model definition as defined in learn_webgl_obj_to_arrays.js, and
 * Perform the following tasks:
 *   - Create appropriate Buffers Objects for the model data in the GPU
 *   - Render the model using the shader programs: shader05.vert, shader05.frag
 *   - The model's Buffer Objects can be deleted from the GPU
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
// Build, create, copy and render 3D objects specific to a particular
// model definition and particular WebGL shaders.
//-------------------------------------------------------------------------
/**
 * A class that can create buffer objects for a model, render the model,
 * and delete the model.
 * @param gl WebGLRenderingContext
 * @param program WebGLProgramn The shader program to render the visible scene
 * @param shadow_program WebGLProgram The shader program to render the shadow map
 * @param model ModelArrays The arrays that define the model
 * @param out LearnWebglConsoleMessages Functionality to display messages to the web page
 * @constructor
 */
var LearnWebglModelRenderShadowsID = function (gl, program, shadow_program, model, out, model_id) {

  var self = this;

  // Variables to remember so the model can be rendered.
  var number_triangles = 0;
  var triangles_vertex_buffer_id = null;
  var triangles_color_buffer_id = null;
  var triangles_normal_buffer_id = null;
  var triangles_smooth_normal_buffer_id = null;
  var triangle_ids = null;
  var number_ids = 0;

  var shadow_map_texture = null;

  var number_lines = 0;
  var lines_vertex_buffer_id = null;
  var lines_color_buffer_id = null;

  var number_points = 0;
  var points_vertex_buffer_id = null;
  var points_color_buffer_id = null;

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
   * Create a list of unique ID's for each triangle
   * @returns Float32Array
   * @private
   */
  function _create_ids() {
    var j, k, ids;

    number_ids = number_triangles * 3;
    ids = new Float32Array(number_ids);

    k = 0;
    for (j = 0; j < number_ids; j += 3) {
      ids[j]   = k;
      ids[j+1] = k;
      ids[j+2] = k;
      k += 1;
    }

    return ids;
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
      triangle_ids = _createBufferObject(_create_ids());
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
  function _getShaderVariableLocations() {

    program.u_PVM_transform = gl.getUniformLocation(program, "u_PVM_transform");
    program.u_VM_transform = gl.getUniformLocation(program, "u_VM_transform");
    program.u_Shadowmap_transform = gl.getUniformLocation(program, "u_Shadowmap_transform");

    program.u_Tolerance_constant = gl.getUniformLocation(program, "u_Tolerance_constant");
    program.u_Model_id = gl.getUniformLocation(program, "u_Model_id");

    program.u_Light_position = gl.getUniformLocation(program, "u_Light_position");
    program.u_Light_color = gl.getUniformLocation(program, "u_Light_color");
    program.u_Ambient_color = gl.getUniformLocation(program, "u_Ambient_color");
    program.u_Shininess = gl.getUniformLocation(program, "u_Shininess");

    program.a_Vertex        = gl.getAttribLocation(program, 'a_Vertex');
    program.a_Color         = gl.getAttribLocation(program, 'a_Color');
    program.a_Vertex_normal = gl.getAttribLocation(program, 'a_Vertex_normal');
    program.a_Surface_id    = gl.getAttribLocation(program, 'a_Surface_id');

    shadow_program.u_PVM_transform = gl.getUniformLocation(shadow_program, "u_PVM_transform");
    shadow_program.u_Model_id      = gl.getUniformLocation(shadow_program, "u_Model_id");
    shadow_program.a_Vertex        = gl.getAttribLocation(shadow_program, 'a_Vertex');
    shadow_program.a_Surface_id    = gl.getAttribLocation(shadow_program, 'a_Surface_id');
  }

  //-----------------------------------------------------------------------
  // These one-time tasks set up the rendering of the models.
  _buildBufferObjects();
  _getShaderVariableLocations();

  //-----------------------------------------------------------------------
  /**
   * Remove the Buffer Objects used by this model on the GPU
   */
  self.delete = function () {
    if (number_triangles > 0) {
      gl.deleteBuffer(triangles_vertex_buffer_id);
      gl.deleteBuffer(triangles_color_buffer_id);
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
   * Remove the Buffer Objects used by this model on the GPU
   */
  self.setShadowMap = function (texture) {
    shadow_map_texture = texture;
  };

  //-----------------------------------------------------------------------
  /**
   * Render the individual points in the model.
   * @private
   */
  function _renderPoints() {
    if (number_points > 0) {
      // Activate the model's vertex object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, points_vertex_buffer_id);

      // Bind the vertices VOB to the 'a_Vertex' shader variable
      //var stride = self.vertices3[0].BYTES_PER_ELEMENT*3;
      gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Vertex);

      // Activate the model's point color object buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, points_color_buffer_id);

      // Bind the colors VOB to the 'a_Color' shader variable
      gl.vertexAttribPointer(program.a_Color, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Color);

      // Draw all of the lines
      gl.drawArrays(gl.POINTS, 0, number_points);
    }
  }

  //-----------------------------------------------------------------------
  /**
   * Render the individual lines in the model.
   * @private
   */
  function _renderLines() {
    if (number_lines > 0) {
      // Activate the model's line vertex object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, lines_vertex_buffer_id);

      // Bind the vertices VOB to the 'a_Vertex' shader variable
      //var stride = self.vertices3[0].BYTES_PER_ELEMENT*3;
      gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Vertex);

      // Activate the model's line color object buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, lines_color_buffer_id);

      // Bind the colors VOB to the 'a_Color' shader variable
      gl.vertexAttribPointer(program.a_Color, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Color);

      // Draw all of the lines
      gl.drawArrays(gl.LINES, 0, number_lines * 2);
    }
  }

  //-----------------------------------------------------------------------
  /**
   * Render the triangles in the model.
   * @private
   */
  function _renderTriangles() {
    if (number_triangles > 0) {

      if (gl.getParameter(gl.CURRENT_PROGRAM) === shadow_program) {

        // Activate the model's triangle vertex object buffer (VOB)
        gl.bindBuffer(gl.ARRAY_BUFFER, triangles_vertex_buffer_id);

        // Bind the vertices VOB to the 'a_Vertex' shader variable
        //var stride = self.vertices3[0].BYTES_PER_ELEMENT*3;
        gl.vertexAttribPointer(shadow_program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shadow_program.a_Vertex);

        // Activate the model's triangle vertex object buffer (VOB)
        gl.bindBuffer(gl.ARRAY_BUFFER, triangle_ids);

        // Bind the vertices VOB to the 'a_Vertex' shader variable
        //var stride = self.vertices3[0].BYTES_PER_ELEMENT*3;
        gl.vertexAttribPointer(shadow_program.a_Surface_id, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shadow_program.a_Surface_id);

        // Draw all of the triangles
        gl.drawArrays(gl.TRIANGLES, 0, number_triangles * 3);

      } else if (gl.getParameter(gl.CURRENT_PROGRAM) === program) {
        // Activate the model's triangle vertex object buffer (VOB)
        gl.bindBuffer(gl.ARRAY_BUFFER, triangles_vertex_buffer_id);

        // Bind the vertices VOB to the 'a_Vertex' shader variable
        //var stride = self.vertices3[0].BYTES_PER_ELEMENT*3;
        gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(program.a_Vertex);

        // Activate the model's triangle color object buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, triangles_color_buffer_id);

        // Bind the colors VOB to the 'a_Color' shader variable
        gl.vertexAttribPointer(program.a_Color, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(program.a_Color);

        // Activate the model's triangle normal vector object buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, triangles_smooth_normal_buffer_id);

        // Bind the normal vectors VOB to the 'a_Normal' shader variable
        gl.vertexAttribPointer(program.a_Vertex_normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(program.a_Vertex_normal);

        // Activate the model's triangle vertex object buffer (VOB)
        gl.bindBuffer(gl.ARRAY_BUFFER, triangle_ids);

        // Bind the vertices VOB to the 'a_Vertex' shader variable
        //var stride = self.vertices3[0].BYTES_PER_ELEMENT*3;
        gl.vertexAttribPointer(program.a_Surface_id, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(program.a_Surface_id);

        // Draw all of the triangles
        gl.drawArrays(gl.TRIANGLES, 0, number_triangles * 3);
      }
    }
  }

  //-----------------------------------------------------------------------
  /**
   * Render the model under the specified transformation.
   * @param pvm_transform Float32Array A perspective,view,model transformation matrix.
   * @param vm_transform Float32Array A view,model transformation matrix.
   */
  self.render = function (pvm_transform, vm_transform) {

    if (gl.getParameter(gl.CURRENT_PROGRAM) === shadow_program) {

      // Set the transform for all the faces, lines, and points
      gl.uniformMatrix4fv(shadow_program.u_PVM_transform, false, pvm_transform);
      gl.uniform1i(shadow_program.u_Model_id, model_id);

    } else if (gl.getParameter(gl.CURRENT_PROGRAM) === program) {

      // Set the transform for all the faces, lines, and points
      gl.uniformMatrix4fv(program.u_PVM_transform, false, pvm_transform);
      gl.uniformMatrix4fv(program.u_VM_transform, false, vm_transform);

      gl.uniform1i(program.u_Model_id, model_id);

      // Makes the "texture unit" 0 be the active texture unit.
      gl.activeTexture(gl.TEXTURE0);

      // Make the texture_object be the active texture. This binds the
      // texture_object to "texture unit" 0.
      gl.bindTexture(gl.TEXTURE_2D, shadow_map_texture);

      // Tell the shader program to use "texture unit" 0
      gl.uniform1i(program.u_Sampler, 0);
    }

    _renderPoints();
    _renderLines();
    _renderTriangles();
  };

};
