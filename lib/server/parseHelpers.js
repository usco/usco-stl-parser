'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseSteps = parseSteps;
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
}

function parseBinary(data) {
  var reader = new DataView(data);
  var faces = reader.getUint32(80, true);
  var dataOffset = 84;
  var faceLength = 12 * 4 + 2;
  var offset = 0;

  var vertices = new Float32Array(faces * 3 * 3);
  var normals = new Float32Array(faces * 3 * 3);

  for (var face = 0; face < faces; face++) {
    var start = dataOffset + face * faceLength;

    for (var i = 1; i <= 3; i++) {
      var vertexstart = start + i * 12;

      vertices[offset] = reader.getFloat32(vertexstart, true);
      vertices[offset + 1] = reader.getFloat32(vertexstart + 4, true);
      vertices[offset + 2] = reader.getFloat32(vertexstart + 8, true);

      normals[offset] = reader.getFloat32(start, true);
      normals[offset + 1] = reader.getFloat32(start + 4, true);
      normals[offset + 2] = reader.getFloat32(start + 8, true);
      offset += 3;
    }
  }
  return { vertices: vertices, normals: normals };
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

  var vertices = new Float32Array(faces * 3 * 3);
  var normals = new Float32Array(faces * 3 * 3);

  vertices.set(posArray);
  normals.set(normArray);

  return { vertices: vertices, normals: normals };
}