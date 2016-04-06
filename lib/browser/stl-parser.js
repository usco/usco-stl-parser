(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.stlParser = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
(function (process){
(function () {
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
}).call(this,require('_process'))
},{"_process":1}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.outputs = undefined;
exports.default = parse;

var _compositeDetect = require('composite-detect');

var _compositeDetect2 = _interopRequireDefault(_compositeDetect);

var _assign = require('fast.js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _rx = typeof window !== "undefined" ? window['Rx'] : typeof global !== "undefined" ? global['Rx'] : null;

var _rx2 = _interopRequireDefault(_rx);

var _parseHelpers = require('./parseHelpers');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

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
 *  var parser = new STLParser()
 *  var loader = new THREE.XHRLoader( parser )
 *  loader.addEventListener( 'load', function ( event ) {
 *
 *    var geometry = event.content
 *    scene.add( new THREE.Mesh( geometry ) )
 *
 *  } )
 *  loader.load( './models/stl/slotted_disk.stl' )
 */

// var detectEnv = require("composite-detect")
var outputs = exports.outputs = ['geometry']; // to be able to auto determine data type(s) fetched by parser

function parse(data) {
  var parameters = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var defaults = {
    useWorker: _compositeDetect2.default.isBrowser === true
  };
  parameters = (0, _assign2.default)({}, defaults, parameters);
  var _parameters = parameters;
  var useWorker = _parameters.useWorker;

  var obs = new _rx2.default.ReplaySubject(1);

  if (useWorker) {
    (function () {
      // var Worker = require("./worker.js")//Webpack worker!
      // var worker = new Worker

      // TODO: for node.js side use https://github.com/audreyt/node-webworker-threads for similar speedups
      var worker = new Worker((window.URL || window.webkitURL || window.mozURL).createObjectURL(new Blob(['(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module \'"+o+"\'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){\n\'use strict\';\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports.parseSteps = parseSteps;\nexports.parseBinary = parseBinary;\nexports.parseASCII = parseASCII;\n\nvar _utils = require(\'./utils\');\n\nfunction parseSteps(data) {\n  data = (0, _utils.ensureBinary)(data);\n  var isBinary = (0, _utils.isDataBinary)(data);\n\n  var result = null;\n  if (isBinary) {\n    result = parseBinary(data);\n  } else {\n    result = parseASCII((0, _utils.ensureString)(data));\n  }\n  return result;\n}\n\nfunction parseBinary(data) {\n  var reader = new DataView(data);\n  var faces = reader.getUint32(80, true);\n  var dataOffset = 84;\n  var faceLength = 12 * 4 + 2;\n  var offset = 0;\n\n  var positions = new Float32Array(faces * 3 * 3);\n  var normals = new Float32Array(faces * 3 * 3);\n\n  for (var face = 0; face < faces; face++) {\n    var start = dataOffset + face * faceLength;\n\n    for (var i = 1; i <= 3; i++) {\n      var vertexstart = start + i * 12;\n\n      positions[offset] = reader.getFloat32(vertexstart, true);\n      positions[offset + 1] = reader.getFloat32(vertexstart + 4, true);\n      positions[offset + 2] = reader.getFloat32(vertexstart + 8, true);\n\n      normals[offset] = reader.getFloat32(start, true);\n      normals[offset + 1] = reader.getFloat32(start + 4, true);\n      normals[offset + 2] = reader.getFloat32(start + 8, true);\n      offset += 3;\n    }\n  }\n  return { positions: positions, normals: normals };\n}\n\n// ASCII stl parsing\nfunction parseASCII(data) {\n  var normal, patternFace, patternNormal, patternVertex, result, text;\n  patternFace = /facet([\\s\\S]*?)endfacet/g;\n\n  var posArray = [];\n  var normArray = [];\n  // var indicesArray = []\n  var faces = 0;\n\n  while ((result = patternFace.exec(data)) !== null) {\n    var length = 0;\n\n    text = result[0];\n    patternNormal = /normal[\\s]+([\\-+]?[0-9]+\\.?[0-9]*([eE][\\-+]?[0-9]+)?)+[\\s]+([\\-+]?[0-9]*\\.?[0-9]+([eE][\\-+]?[0-9]+)?)+[\\s]+([\\-+]?[0-9]*\\.?[0-9]+([eE][\\-+]?[0-9]+)?)+/g;\n\n    while ((result = patternNormal.exec(text)) !== null) {\n      normArray.push(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));\n      normArray.push(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));\n      normArray.push(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));\n    }\n\n    patternVertex = /vertex[\\s]+([\\-+]?[0-9]+\\.?[0-9]*([eE][\\-+]?[0-9]+)?)+[\\s]+([\\-+]?[0-9]*\\.?[0-9]+([eE][\\-+]?[0-9]+)?)+[\\s]+([\\-+]?[0-9]*\\.?[0-9]+([eE][\\-+]?[0-9]+)?)+/g;\n\n    while ((result = patternVertex.exec(text)) !== null) {\n      posArray.push(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));\n      length += 1;\n    }\n    faces += 1;\n  }\n\n  var positions = new Float32Array(faces * 3 * 3);\n  var normals = new Float32Array(faces * 3 * 3);\n\n  positions.set(posArray);\n  normals.set(normArray);\n\n  return { positions: positions, normals: normals };\n}\n\n},{"./utils":2}],2:[function(require,module,exports){\n\'use strict\';\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports.ensureString = ensureString;\nexports.ensureBinary = ensureBinary;\nexports.isDataBinary = isDataBinary;\nfunction ensureString(buf) {\n  if (typeof buf !== \'string\') {\n    var array_buffer = new Uint8Array(buf);\n    var str = \'\';\n    for (var i = 0; i < buf.byteLength; i++) {\n      str += String.fromCharCode(array_buffer[i]); // implicitly assumes little-endian\n    }\n    return str;\n  } else {\n    return buf;\n  }\n}\n\nfunction ensureBinary(buf) {\n  if (typeof buf === \'string\') {\n    var array_buffer = new Uint8Array(buf.length);\n    for (var i = 0; i < buf.length; i++) {\n      array_buffer[i] = buf.charCodeAt(i) & 0xff; // implicitly assumes little-endian\n    }\n    return array_buffer.buffer || array_buffer;\n  } else {\n    return buf;\n  }\n}\n\nfunction isDataBinary(data) {\n  var expect, face_size, n_faces, reader;\n  reader = new DataView(data);\n  face_size = 32 / 8 * 3 + 32 / 8 * 3 * 3 + 16 / 8;\n\n  n_faces = reader.getUint32(80, true);\n  expect = 80 + 32 / 8 + n_faces * face_size;\n  return expect === reader.byteLength;\n}\n\n},{}],3:[function(require,module,exports){\n\'use strict\';\n\nvar _parseHelpers = require(\'./parseHelpers\');\n\nself.onmessage = function (event) {\n  var result = (0, _parseHelpers.parseSteps)(event.data.data);\n\n  var positions = result.positions.buffer;\n  var normals = result.normals.buffer;\n  self.postMessage({ positions: positions, normals: normals }, [positions, normals]);\n  self.close();\n}; // importScripts(\'./stl-utils.js\')\n\n},{"./parseHelpers":1}]},{},[3])'], { type: "text/javascript" }))); //browserify
      worker.onmessage = function (event) {
        var positions = new Float32Array(event.data.positions);
        var normals = new Float32Array(event.data.normals);
        var geometry = { positions: positions, normals: normals };

        obs.onNext({ progress: 1, total: positions.length });
        obs.onNext(geometry);
        obs.onCompleted();
      };
      worker.onerror = function (event) {
        obs.onError('filename:' + event.filename + ' lineno: ' + event.lineno + ' error: ' + event.message);
      };

      worker.postMessage({ data: data });
      obs.catch(function (e) {
        return worker.terminate();
      });
    })();
  } else {
    try {
      var result = (0, _parseHelpers.parseSteps)(data);
      obs.onNext({ progress: 1, total: result.positions.length });
      obs.onNext(result);
      obs.onCompleted();
    } catch (error) {
      obs.onError(error);
    }
  }

  return obs;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./parseHelpers":5,"composite-detect":2,"fast.js/object/assign":3}],5:[function(require,module,exports){
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

},{"./utils":6}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ensureString = ensureString;
exports.ensureBinary = ensureBinary;
exports.isDataBinary = isDataBinary;
function ensureString(buf) {
  if (typeof buf !== 'string') {
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
  if (typeof buf === 'string') {
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

},{}]},{},[4])(4)
});