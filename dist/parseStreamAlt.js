'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = makeStreamParser;
exports.parseASCIIChunk = parseASCIIChunk;

var _utils = require('./utils');

/*
this version of the parser tries to get rid of the dependency on node.js Buffer
- works for binary files
- for some reason fails with ASCII files, very likely due to how data is cut and reassembled
*/
function makeStreamParser() {
  var chunkNb = 0;
  var isBinary = false;

  var faceOffset = 0;
  var previousRemainderData = void 0;

  var parser = function parser(chunk, enc, callback) {
    // console.log('chunk', chunk.length, chunkNb)
    if (chunkNb === 0) {
      isBinary = (0, _utils.isDataBinaryRobust)(chunk);
    }

    var workChunk = void 0;
    if (previousRemainderData) {
      workChunk = new Uint8Array(previousRemainderData.byteLength + chunk.byteLength);
      workChunk.set(new Uint8Array(previousRemainderData));
      workChunk.set(new Uint8Array(chunk), previousRemainderData.byteLength);
      workChunk = workChunk.buffer;
      //let data = ensureString(workChunk)
    } else {
      workChunk = chunk;
    }

    var _ref = isBinary ? computeBinaryOffset(workChunk, chunkNb) : computASCIIOffset(workChunk, chunkNb),
        remainingDataInChunk = _ref.remainingDataInChunk,
        startOffset = _ref.startOffset;

    var parsed = isBinary ? parseBinaryChunk(faceOffset, remainingDataInChunk, startOffset, workChunk) : parseASCIIChunk(workChunk);
    // console.log('faceOffset', faceOffset, 'facesInChunk', facesInChunk, 'remainderDataLength', remainderDataLength, 'current face ', face)

    // update size
    chunkNb += 1;

    previousRemainderData = parsed.remainderData;
    faceOffset = parsed.faceOffset;

    callback(null, parsed.data);
  };

  return parser;
}

function computeBinaryOffset(workChunk, chunkNb) {
  var dataStartOffset = 84;
  var remainingDataInChunk = chunkNb === 0 ? workChunk.byteLength - dataStartOffset : workChunk.byteLength;
  var startOffset = chunkNb === 0 ? dataStartOffset : 0;

  return { remainingDataInChunk: remainingDataInChunk, startOffset: startOffset };
}

function computASCIIOffset(workChunk, chunkNb) {
  return { remainingDataInChunk: workChunk.length, startOffset: 0 };
}

function parseBinaryChunk(faceOffset, remainingDataInChunk, startOffset, workChunk) {
  // console.log('faces', faces, 'chunk size', chunk.length, 'workChunk', workChunk.length)
  // process all faces data that we can
  var faceLength = 12 * 4 + 2;
  var facesInChunk = Math.floor(remainingDataInChunk / faceLength);

  var reader = new DataView(workChunk);
  var faces = reader.getUint32(80, true);
  // let positions = new Float32Array(facesInChunk * 3 * 3)
  // let normals = new Float32Array(facesInChunk * 3 * 3)

  var halfLength = facesInChunk * 3 * 3;
  var data = new Float32Array(facesInChunk * 2 * 3 * 3); // we want one big typedArray for all the data , to avoid concat operations

  var lface = 0;
  var offset = 0;

  // console.log(`Faces: ${facesInChunk}/${faces}`)

  for (var face = faceOffset; face < facesInChunk + faceOffset; face += 1) {
    var start = startOffset + lface * faceLength;
    for (var i = 1; i <= 3; i++) {
      var vertexstart = start + i * 12;
      data[offset] = reader.getFloat32(vertexstart, true);
      data[offset + 1] = reader.getFloat32(vertexstart + 4, true);
      data[offset + 2] = reader.getFloat32(vertexstart + 8, true);

      data[offset + halfLength] = reader.getFloat32(start, true);
      data[offset + halfLength + 1] = reader.getFloat32(start + 4, true);
      data[offset + halfLength + 2] = reader.getFloat32(start + 8, true);
      offset += 3;
    }
    lface += 1;
  }

  // compute offsets, remainderData etc for next chunk etc
  var remainderData = workChunk.slice(workChunk.byteLength - remainingDataInChunk % faceLength);
  // workChunk.slice(workChunk.length - remainingDataInChunk % faceLength) // chunk length - remainderDataLength

  return { faceOffset: lface, remainderData: remainderData, data: data };
}

// taken from http://stackoverflow.com/questions/6965107/converting-between-strings-and-arraybuffers
function str2ab(str) {
  var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return new Uint8Array(buf);
  /*var idx, len = str.length, arr = new Array( len );
   for ( idx = 0 ; idx < len ; ++idx ) {
       arr[ idx ] = str.charCodeAt(idx) & 0xFF;
   }
   // You may create an ArrayBuffer from a standard array (of values) as follows:
   return new Uint8Array( arr )*/
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

  /*let positions = new Float32Array(faces * 3 * 3)
  let normals = new Float32Array(faces * 3 * 3)
   positions.set(posArray)
  normals.set(normArray)*/
  var outData = new Float32Array(faces * 3 * 3 * 2);
  outData.set(posArray);
  outData.set(normArray, posArray.byteLength);

  // compute offsets, remainderData etc for next chunk etc
  var remainderTextData = data.slice(offset);
  var remainderData = str2ab(remainderTextData);
  var check = (0, _utils.ensureString)(remainderData);
  //console.log('remainderData', remainderTextData, remainderData)
  return { faceOffset: faces, remainderData: remainderData, data: outData };
}