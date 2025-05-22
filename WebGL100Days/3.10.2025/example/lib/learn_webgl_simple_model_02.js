/**
 * learn_webgl_simple_model_01.js, By Wayne Brown, Spring 2016
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
 * A simple triangle composed of 3 vertices.
 * @param vertices Array of 3 vertices.
 * @param color Array of RGB values.
 * @constructor
  */
function Triangle(vertices, color) {
  var self = this;
  self.vertices = vertices;
  self.color = color;
}

//-------------------------------------------------------------------------
/**
 * A simple model composed of an array of triangles.
 * @param name String The name of the model.
 * @constructor
 */
function Simple_model(name) {
  var self = this;
  self.name = name;
  self.triangles = [];
}

//-------------------------------------------------------------------------
/**
 * Create a Simple_model of 4 triangles that forms a pyramid.
 * @constructor
 */
function Create_pyramid() {
  var triangle1, triangle2, triangle3, triangle4;
  var red, green, blue, purple;
  var vertices = [  [ 0.0, -0.25, -0.50],
                    [ 0.0,  0.25,  0.00],
                    [ 0.5, -0.25,  0.25],
                    [-0.5, -0.25,  0.25] ];
  red    = [1.0, 0.0, 0.0];
  green  = [0.0, 1.0, 0.0];
  blue   = [0.0, 0.0, 1.0];
  purple = [1.0, 0.0, 1.0];

  triangle1 = new Triangle([vertices[2], vertices[1], vertices[3]], green);
  triangle2 = new Triangle([vertices[3], vertices[1], vertices[0]], blue);
  triangle3 = new Triangle([vertices[0], vertices[1], vertices[2]], red);
  triangle4 = new Triangle([vertices[0], vertices[2], vertices[3]], purple);

  var model = new Simple_model("simple");
  model.triangles = [ triangle1, triangle2, triangle3, triangle4 ];
}
