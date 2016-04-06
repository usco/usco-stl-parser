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

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _parseHelpers = require('./parseHelpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
      var worker = new Worker("./worker.js"); //browserify
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