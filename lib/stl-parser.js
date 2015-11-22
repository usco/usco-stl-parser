module.exports =
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

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.outputs = undefined;
	exports.default = parse;

	var _compositeDetect = __webpack_require__(1);

	var _compositeDetect2 = _interopRequireDefault(_compositeDetect);

	var _assign = __webpack_require__(3);

	var _assign2 = _interopRequireDefault(_assign);

	var _rx = __webpack_require__(4);

	var _rx2 = _interopRequireDefault(_rx);

	var _parseHelpers = __webpack_require__(5);

	var _utils = __webpack_require__(6);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	//var Rx = require('rx')

	var outputs = exports.outputs = ["geometry"]; //to be able to auto determine data type(s) fetched by parser

	/**
	 * @author aleeper / http://adamleeper.com/
	 * @author mrdoob / http://mrdoob.com/
	 * @author gero3 / https://github.com/gero3
	 * @author kaosat-dev / https://github.com/kaosat-dev
	 *
	 * Description: A THREE parser for STL ASCII files & BINARY, as created by Solidworks and other CAD programs.
	 *
	 * Supports both binary and ASCII encoded files, with automatic detection of type.
	 *
	 * Limitations:
	 *  Binary decoding ignores header. There doesn't seem to be much of a use for it.
	 *  There is perhaps some question as to how valid it is to always assume little-endian-ness.
	 *  ASCII decoding assumes file is UTF-8. Seems to work for the examples...
	 *
	 * Usage:
	 *  var parser = new STLParser();
	 *  var loader = new THREE.XHRLoader( parser );
	 *  loader.addEventListener( 'load', function ( event ) {
	 *
	 *    var geometry = event.content;
	 *    scene.add( new THREE.Mesh( geometry ) );
	 *
	 *  } );
	 *  loader.load( './models/stl/slotted_disk.stl' );
	 */

	//var detectEnv = require("composite-detect");
	function parse(data) {
	  var parameters = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	  var defaults = {
	    useWorker: _compositeDetect2.default.isBrowser === true
	  };
	  parameters = (0, _assign2.default)({}, defaults, parameters);
	  var _parameters = parameters;
	  var useWorker = _parameters.useWorker;

	  console.log("useWorker", useWorker);

	  var obs = new _rx2.default.ReplaySubject(1);

	  if (useWorker) {
	    var Worker = __webpack_require__(7); //Webpack worker!
	    //var worker = new Worker
	    //let worker = new Worker( "./stl-worker.js" )//browserify

	    worker.onmessage = function (event) {
	      var vertices = new Float32Array(event.data.vertices);
	      var normals = new Float32Array(event.data.normals);
	      var geometry = { vertices: vertices, normals: normals };

	      obs.onNext({ progress: 100, total: vertices.length });
	      obs.onNext(geometry);
	      obs.onCompleted();
	    };
	    worker.postMessage({ data: data });
	    obs.catch(function (e) {
	      return worker.terminate();
	    });
	  } else {
	    data = (0, _utils.ensureBinary)(data);
	    var isBinary = (0, _utils.isDataBinary)(data);

	    if (isBinary) {
	      obs.onNext((0, _parseHelpers.parseBinary)(data));
	    } else {
	      obs.onNext((0, _parseHelpers.parseASCII)((0, _utils.ensureString)(data)));
	    }
	  }

	  return obs;
	}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {(function () {
	  // Hueristics.
	  var isNode = typeof process !== 'undefined' && process.versions && !!process.versions.node;
	  var isBrowser = typeof window !== 'undefined';
	  var isModule = typeof module !== 'undefined' && !!module.exports;

	  // Export.
	  var detect = (isModule ? exports : (this.detect = {}));
	  detect.isNode = isNode;
	  detect.isBrowser = isBrowser;
	  detect.isModule = isModule;
	}).call(this);
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 2 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Analogue of Object.assign().
	 * Copies properties from one or more source objects to
	 * a target object. Existing keys on the target object will be overwritten.
	 *
	 * > Note: This differs from spec in some important ways:
	 * > 1. Will throw if passed non-objects, including `undefined` or `null` values.
	 * > 2. Does not support the curious Exception handling behavior, exceptions are thrown immediately.
	 * > For more details, see:
	 * > https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
	 *
	 *
	 *
	 * @param  {Object} target      The target object to copy properties to.
	 * @param  {Object} source, ... The source(s) to copy properties from.
	 * @return {Object}             The updated target object.
	 */
	module.exports = function fastAssign (target) {
	  var totalArgs = arguments.length,
	      source, i, totalKeys, keys, key, j;

	  for (i = 1; i < totalArgs; i++) {
	    source = arguments[i];
	    keys = Object.keys(source);
	    totalKeys = keys.length;
	    for (j = 0; j < totalKeys; j++) {
	      key = keys[j];
	      target[key] = source[key];
	    }
	  }
	  return target;
	};


/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("Rx");

/***/ },
/* 5 */
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
/* 6 */
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

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function() {
		return new Worker(__webpack_require__.p + "stl-worker.js");
	};

/***/ }
/******/ ]);