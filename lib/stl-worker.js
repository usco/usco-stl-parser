/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _parseHelpers = __webpack_require__(1);

	var _utils = __webpack_require__(2);

	/*var utils   = require('./utils')
	var helpers = require('./parseHelpers')*/

	/*self.onmessage = function( event ) {
	  var data = event.data
	  data = data.data
	  data = ensureBinary( data )
	  var isBinary = utils.isDataBinary(data)
	  if(!isBinary){
	    data = utils.ensureString( data )
	  }
	  
	  var result = null
	  if( isBinary )
	  {
	    result = helpers.parseBinary( data )
	  }
	  else{ 
	    result = helpers.parseASCII( data ) 
	  }

	  var vertices = result.vertices.buffer
	  var normals =  result.normals.buffer
	  self.postMessage( {vertices:vertices, normals:normals}, [vertices,normals] )
		self.close()

	}*/

	//importScripts('./stl-utils.js');
	self.onmessage = function (event) {
	  var data = (0, _utils.ensureBinary)(event.data.data);
	  var isBinary = (0, _utils.isDataBinary)(data);

	  var result = null;
	  if (isBinary) {
	    result = (0, _parseHelpers.parseBinary)(data);
	  } else {
	    result = (0, _utils.ensureString)((0, _parseHelpers.parseASCII)(data));
	  }

	  var vertices = result.vertices.buffer;
	  var normals = result.normals.buffer;
	  self.postMessage({ vertices: vertices, normals: normals }, [vertices, normals]);
	  self.close();
	};

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.parseBinary = parseBinary;
	exports.parseASCII = parseASCII;
	exports.geometryFromBuffers = geometryFromBuffers;
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

	//ASCII stl parsing
	function parseASCII(data) {

	  var normal, patternFace, patternNormal, patternVertex, result, text;
	  patternFace = /facet([\s\S]*?)endfacet/g;

	  var posArray = [];
	  var normArray = [];
	  var indicesArray = [];
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

	function geometryFromBuffers(_ref) {
	  var vertices = _ref.vertices;
	  var normals = _ref.normals;

	  var geometry = new THREE.BufferGeometry();
	  geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
	  geometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3));
	  return geometry;
	}

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.ensureString = ensureString;
	exports.ensureBinary = ensureBinary;
	exports.isDataBinary = isDataBinary;
	function ensureString(buf) {

	  if (typeof buf !== "string") {
	    var array_buffer = new Uint8Array(buf);
	    var str = '';
	    for (var i = 0; i < buf.byteLength; i++) {
	      str += String.fromCharCode(array_buffer[i]); // implicitly assumes little-endian
	    }
	    return str;
	  } else {
	    return buf;
	  }
	}

	function ensureBinary(buf) {

	  if (typeof buf === "string") {
	    var array_buffer = new Uint8Array(buf.length);
	    for (var i = 0; i < buf.length; i++) {
	      array_buffer[i] = buf.charCodeAt(i) & 0xff; // implicitly assumes little-endian
	    }
	    return array_buffer.buffer || array_buffer;
	  } else {
	    return buf;
	  }
	}

	function isDataBinary(data) {
	  var expect, face_size, n_faces, reader;
	  reader = new DataView(data);
	  face_size = 32 / 8 * 3 + 32 / 8 * 3 * 3 + 16 / 8;

	  n_faces = reader.getUint32(80, true);
	  expect = 80 + 32 / 8 + n_faces * face_size;
	  return expect === reader.byteLength;
	}

/***/ }
/******/ ]);