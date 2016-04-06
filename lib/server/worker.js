'use strict';

var _parseHelpers = require('./parseHelpers');

self.onmessage = function (event) {
  var result = (0, _parseHelpers.parseSteps)(event.data.data);

  var positions = result.positions.buffer;
  var normals = result.normals.buffer;
  self.postMessage({ positions: positions, normals: normals }, [positions, normals]);
  self.close();
}; // importScripts('./stl-utils.js')