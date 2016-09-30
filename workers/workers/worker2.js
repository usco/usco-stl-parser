(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseSteps;
exports.parseBinary = parseBinary;
exports.parseASCII = parseASCII;

var _utils = require('./utils');

function parseSteps(data) {
  data = (0, _utils.ensureBinary)(data);
  var isBinary = (0, _utils.isDataBinary)(data);

  var result = null;
  if (isBinary) {
    result = parseBinary(data);
  } else {
    result = parseASCII((0, _utils.ensureString)(data));
  }
  return result;

  //  return isBinary ? parseBinary(data) : parseASCII(ensureString(data))
}

function parseBinary(data) {
  var reader = new DataView(data);
  var faces = reader.getUint32(80, true);
  var dataOffset = 84;
  var faceLength = 12 * 4 + 2;
  var offset = 0;

  var positions = new Float32Array(faces * 3 * 3);
  var normals = new Float32Array(faces * 3 * 3);

  for (var face = 0; face < faces; face++) {
    var start = dataOffset + face * faceLength;

    for (var i = 1; i <= 3; i++) {
      var vertexstart = start + i * 12;

      positions[offset] = reader.getFloat32(vertexstart, true);
      positions[offset + 1] = reader.getFloat32(vertexstart + 4, true);
      positions[offset + 2] = reader.getFloat32(vertexstart + 8, true);

      normals[offset] = reader.getFloat32(start, true);
      normals[offset + 1] = reader.getFloat32(start + 4, true);
      normals[offset + 2] = reader.getFloat32(start + 8, true);
      offset += 3;
    }
  }
  return { positions: positions, normals: normals };
}

// ASCII stl parsing
function parseASCII(data) {
  var normal, patternFace, patternNormal, patternVertex, result, text;
  patternFace = /facet([\s\S]*?)endfacet/g;

  var posArray = [];
  var normArray = [];
  // var indicesArray = []
  var faces = 0;

  while ((result = patternFace.exec(data)) !== null) {
    var length = 0;

    text = result[0];
    patternNormal = /normal[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

    while ((result = patternNormal.exec(text)) !== null) {
      normArray.push(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));
      normArray.push(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));
      normArray.push(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));
    }

    patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

    while ((result = patternVertex.exec(text)) !== null) {
      posArray.push(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));
      length += 1;
    }
    faces += 1;
  }

  var positions = new Float32Array(faces * 3 * 3);
  var normals = new Float32Array(faces * 3 * 3);

  positions.set(posArray);
  normals.set(normArray);

  return { positions: positions, normals: normals };
}

},{"./utils":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ensureString = ensureString;
exports.ensureBinary = ensureBinary;
exports.isDataBinary = isDataBinary;
exports.isDataBinaryRobust = isDataBinaryRobust;
function ensureString(buf) {
  //console.log('ensureString')
  if (typeof buf !== 'string') {
    //console.log('forcing string', buf)
    var array_buffer = new Uint8Array(buf);
    var str = '';
    for (var i = 0; i < buf.byteLength; i++) {
      str += String.fromCharCode(array_buffer[i]); // implicitly assumes little-endian
    }
    return str;
  } else {
    //console.log('already string')
    return buf;
  }
}

function ensureBinary(buf) {
  //console.log('ensureBinary')
  if (typeof buf === 'string') {
    //console.log('forcing binary')
    var array_buffer = new Uint8Array(buf.length);
    for (var i = 0; i < buf.length; i++) {
      array_buffer[i] = buf.charCodeAt(i) & 0xff; // implicitly assumes little-endian
    }
    return array_buffer.buffer || array_buffer;
  } else {
    //console.log('already binary')
    return buf;
  }
}

function isDataBinary(data) {
  console.log('data is binary ?');
  var expect, face_size, n_faces, reader;
  reader = new DataView(data);
  face_size = 32 / 8 * 3 + 32 / 8 * 3 * 3 + 16 / 8;

  n_faces = reader.getUint32(80, true);
  expect = 80 + 32 / 8 + n_faces * face_size;
  return expect === reader.byteLength;
}

//a more robust version of the above, that does NOT require the whole file
function isDataBinaryRobust(data) {
  //console.log('data is binary ?')
  var patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;
  var text = ensureString(data);
  var isBinary = patternVertex.exec(text) === null;
  return isBinary;
}

},{}],3:[function(require,module,exports){
'use strict';

var _parseHelpers = require('../../parsers/stl/parseHelpers.js');

var _parseHelpers2 = _interopRequireDefault(_parseHelpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

self.onmessage = function (event) {
  //console.log('event',event.data)
  var result = (0, _parseHelpers2.default)(event.data.buffer);

  var positions = result.positions.buffer;
  var normals = result.normals.buffer;

  //console.log('here in parser worker')

  // console.log('results', 'buffer' in result.positions,  result.positions.buffer === null, result.positions.buffer.byteLength )
  self.postMessage({ positions: positions, normals: normals }, [positions, normals]);
  if ('close' in self) {
    self.close();
  }
};

},{"../../parsers/stl/parseHelpers.js":1}]},{},[3]);
