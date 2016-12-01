'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = makeStreamParser;
exports.parseASCIIChunk = parseASCIIChunk;

var _utils = require('./utils');

function makeStreamParser() {
  var chunkNb = 0;
  var totalSize = 0;
  var isBinary = false;

  var faceOffset = 0;
  var previousRemainderData = void 0;
  var parser = function parser(chunk, enc, callback) {
    //console.log('chunk', chunk.length, chunkNb)
    if (chunkNb === 0) {
      isBinary = (0, _utils.isDataBinaryRobust)(chunk.buffer);
    }
    var workChunk = (0, _utils.ensureBinary)(previousRemainderData ? Buffer.concat([previousRemainderData, chunk], previousRemainderData.length + chunk.length) : chunk);

    var _ref = isBinary ? computeBinaryOffset(workChunk, chunkNb) : computASCIIOffset(workChunk, chunkNb),
        remainingDataInChunk = _ref.remainingDataInChunk,
        startOffset = _ref.startOffset;

    var parsed = isBinary ? parseBinaryChunk(faceOffset, remainingDataInChunk, startOffset, workChunk) : parseASCIIChunk(workChunk);
    //console.log('faceOffset', faceOffset, 'facesInChunk', facesInChunk, 'remainderDataLength', remainderDataLength, 'current face ', face)

    // update size
    chunkNb += 1;
    totalSize += chunk.length;

    previousRemainderData = parsed.remainderData;
    faceOffset = parsed.faceOffset;

    // we can only send a single buffer out , so concat the two
    var positionsBuffer = toBuffer(parsed.positions);
    var normalsBuffer = toBuffer(parsed.normals);
    // console.log('positions', positionsBuffer.length, parsed.positions.length)
    //console.log('done with chunk', positionsBuffer, callback)
    callback(null, Buffer.concat([positionsBuffer, normalsBuffer], positionsBuffer.length + normalsBuffer.length));
  };

  return parser;
}

// helper function, taken from https://github.com/feross/typedarray-to-buffer
function toBuffer(arr) {
  var buf = new Buffer(arr.buffer);
  if (arr.byteLength !== arr.buffer.byteLength) {
    // Respect the "view", i.e. byteOffset and byteLength, without doing a copy
    buf = buf.slice(arr.byteOffset, arr.byteOffset + arr.byteLength);
  }
  return buf;
}

function computeBinaryOffset(workChunk, chunkNb) {
  var dataStartOffset = 84;
  var remainingDataInChunk = chunkNb === 0 ? workChunk.length - dataStartOffset : workChunk.length;
  var startOffset = chunkNb === 0 ? dataStartOffset : 0;

  return { remainingDataInChunk: remainingDataInChunk, startOffset: startOffset };
}

function computASCIIOffset(workChunk, chunkNb) {
  return { remainingDataInChunk: workChunk.length, startOffset: 0 };
}

//handle parsing of a single binary chunk
function parseBinaryChunk(faceOffset, remainingDataInChunk, startOffset, workChunk) {
  // console.log('faces', faces, 'chunk size', chunk.length, 'workChunk', workChunk.length)
  // process all faces data that we can
  var faceLength = 12 * 4 + 2;
  var facesInChunk = Math.floor(remainingDataInChunk / faceLength);

  var reader = new DataView(workChunk.buffer);
  var faces = reader.getUint32(80, true);
  var positions = new Float32Array(facesInChunk * 3 * 3);
  var normals = new Float32Array(facesInChunk * 3 * 3);

  var data = new Float32Array(facesInChunk * 2 * 3 * 3); //we want one big typedArray for all the data , to avoid concat operations

  var lface = 0;
  var offset = 0;

  // console.log(`Faces: ${facesInChunk}/${faces}`)

  for (var face = faceOffset; face < facesInChunk + faceOffset; face += 1) {
    var start = startOffset + lface * faceLength;
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
    lface += 1;
  }

  // compute offsets, remainderData etc for next chunk etc
  var remainderData = workChunk.slice(workChunk.length - remainingDataInChunk % faceLength); // chunk length - remainderDataLength

  return { faceOffset: lface, remainderData: remainderData, positions: positions, normals: normals };
}

// ASCII stl parsing
function parseASCIIChunk(workChunk) {
  var data = (0, _utils.ensureString)(workChunk);
  // console.log('parseASCII')
  var result = void 0,
      text = void 0;
  var patternNormal = /normal[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;
  var patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;
  var patternFace = /facet([\s\S]*?)endfacet/g;

  var posArray = [];
  var normArray = [];

  var faces = 0;
  var offset = 0;

  while ((result = patternFace.exec(data)) !== null) {
    var length = 0;

    text = result[0];
    offset = result.index + text.length;

    while ((result = patternNormal.exec(text)) !== null) {
      normArray.push(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));
      normArray.push(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));
      normArray.push(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));
    }

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

  // compute offsets, remainderData etc for next chunk etc
  var remainderTextData = data.slice(offset);
  // console.log('remainderData', remainderTextData)
  var remainderData = new Buffer(remainderTextData);
  return { faceOffset: faces, remainderData: remainderData, positions: positions, normals: normals };
}