/**
 * learn_webgl_events_01.js, By Wayne Brown, Fall 2015
 *
 * These event handlers can modify the characteristics of a scene.
 * These will be specific to a scene's models and the models' attributes.
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
window.Event_experiments_events_01 = function (scene, control_id_list) {
  var self = this; // Store a local reference to the new object.

  //-----------------------------------------------------------------------
  self.mouse_drag_started = function (event) {
    //console.log("started mouse drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
    start_of_mouse_drag = event;
    event.preventDefault();

    if (animate_is_on) {
      scene.animate_active = false;
    }
  };

  //-----------------------------------------------------------------------
  self.mouse_drag_ended = function (event) {
    //console.log("ended mouse drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
    start_of_mouse_drag = null;

    event.preventDefault();

    if (animate_is_on) {
      scene.animate_active = true;
      self.animate();
    }
  };

  //-----------------------------------------------------------------------
  self.mouse_dragged = function (event) {
    var delta_x, delta_y;

    //console.log("drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
    if (start_of_mouse_drag) {
      delta_x = event.clientX - start_of_mouse_drag.clientX;
      delta_y = -(event.clientY - start_of_mouse_drag.clientY);
      //console.log("moved: " + delta_x + " " + delta_y);

      scene.angle_x += delta_y;
      scene.angle_y -= delta_x;
      scene.render();

      start_of_mouse_drag = event;
      event.preventDefault();
    }
  };

  //-----------------------------------------------------------------------
  self.key_event = function (event) {
    var bounds, keycode;

    bounds = canvas.getBoundingClientRect();
    console.log(
      "bounds = " +
        bounds.left +
        " " +
        bounds.right +
        "  " +
        bounds.top +
        "  " +
        bounds.bottom
    );
    console.log("target = " + event.target);
    if (
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom
    ) {
      keycode = event.keyCode ? event.keyCode : event.which;
      console.log(keycode + " keyboard event in canvas");
    }

    event.preventDefault();

    return false;
  };

  //------------------------------------------------------------------------------
  self.html_control_event = function (event) {
    var control;

    control = $(event.target);
    if (control) {
      switch (control.attr("id")) {
        case "my_pause":
          if (control.is(":checked")) {
            animate_is_on = true;
            scene.animate_active = true;
            self.animate();
          } else {
            animate_is_on = false;
            scene.animate_active = false;
          }
      }
    }
  };

  //------------------------------------------------------------------------------
  self.animate = function () {
    var now, elapsed_time;

    if (scene.animate_active) {
      now = Date.now();
      elapsed_time = now - previous_time;

      if (elapsed_time >= frame_rate) {
        scene.angle_x -= 0.5;
        scene.angle_y += 1;
        scene.render();
        previous_time = now;
      }

      requestAnimationFrame(self.animate);
    }
  };

  //------------------------------------------------------------------------------
  self.removeAllEventHandlers = function () {
    var j;
    for (j = 0; j < control_id_list.length; j += 1) {
      var control = $("#" + control_id_list);
      if (control) {
        control.unbind("click", self.html_control_event);
      }
    }
  };

  //------------------------------------------------------------------------------
  // Constructor code for the class.

  // Private variables
  var out = scene.out; // Debugging and output goes here.
  var canvas = scene.canvas;

  // Remember the current state of events
  var start_of_mouse_drag = null;
  var previous_time = Date.now();
  var animate_is_on = scene.animate_active;

  // Control the rate at which animations refresh
  var frame_rate = 16; // 16 milliseconds = 1/60 sec

  // Add an onclick callback to each HTML control
  var j;
  for (j = 0; j < control_id_list.length; j += 1) {
    var control = $("#" + control_id_list);
    if (control) {
      control.click(self.html_control_event);
    }
  }
};
