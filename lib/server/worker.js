'use strict';

var _parseHelpers = require('./parseHelpers');

//var parseSteps = require('./parseHelpers').parseSteps

//module.exports = function () {
self.onmessage = function (event) {
  var result = (0, _parseHelpers.parseSteps)(event.data.data);

  var positions = result.positions.buffer;
  var normals = result.normals.buffer;

  console.log('here in stl parser worker');

  //console.log('results', 'buffer' in result.positions,  result.positions.buffer === null, result.positions.buffer.byteLength )
  self.postMessage({ positions: positions, normals: normals }, [positions, normals]);
  if ('close' in self) {
    self.close();
  }
};
//}
//'use strict'