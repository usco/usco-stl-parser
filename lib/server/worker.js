'use strict';

var _parseHelpers = require('./parseHelpers');

self.onmessage = function (event) {
  var result = (0, _parseHelpers.parseSteps)(event.data.data);

  var vertices = result.vertices.buffer;
  var normals = result.normals.buffer;
  self.postMessage({ vertices: vertices, normals: normals }, [vertices, normals]);
  self.close();
}; // importScripts('./stl-utils.js')