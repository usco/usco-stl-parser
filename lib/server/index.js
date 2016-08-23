'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
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

/*er = Rx.DOM.fromWebWorker('worker.js');

worker.subscribe(function (e) {
    console.log(e.data);
});

worker.onNext('some data');*/

// var detectEnv = require("composite-detect")


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.outputs = undefined;
exports.default = parse;

var _compositeDetect = require('composite-detect');

var _compositeDetect2 = _interopRequireDefault(_compositeDetect);

var _assign = require('fast.js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _parseHelpers = require('./parseHelpers');

var _most = require('most');

var _most2 = _interopRequireDefault(_most);

var _thread = require('./thread');

var _thread2 = _interopRequireDefault(_thread);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var outputs = exports.outputs = ['geometry']; // to be able to auto determine data type(s) fetched by parser

//import Worker from 'workerjs'


/*export default function parse (data, parameters = {}) {
  const worker$ = fromWebWorker('./worker.js')
  worker$.onNext({data})

  return worker$
    .map(function (event) {
      const positions = new Float32Array(event.data.positions)
      const normals = new Float32Array(event.data.normals)
      // obs.onCompleted()
      obs.onNext({progress: 1, total: positions.length, data: {positions, normals}})
    })
    .catch(function (event) {
      return `filename:${event.filename} lineno: ${event.lineno} error: ${event.message}`
      // e => worker.terminate() ????
    })
}*/

var Worker = function () {
  function Worker(path) {
    _classCallCheck(this, Worker);

    this.path = path;
  }

  _createClass(Worker, [{
    key: 'postMessage',
    value: function postMessage(message) {
      console.log('message', message);
    }
    /*onError (error) {
      console.log(error)
    }*/

  }]);

  return Worker;
}();

function parse(data) {
  var parameters = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  //const obs = new Rx.ReplaySubject(1)
  var worker = (0, _thread2.default)('./worker.js'); // new Worker('./worker.js') // browserify // __dirname + '/worker.js', true)

  var stream = _most2.default.create(function (add, end, error) {
    worker.onmessage = function (event) {
      console.log('on message', event);
      var positions = new Float32Array(event.data.positions);
      var normals = new Float32Array(event.data.normals);

      //obs.onNext({progress: 1, total: positions.length, data: {positions, normals}})
      //obs.onCompleted()
      add({ progress: 1, total: positions.length, data: { positions: positions, normals: normals } });
      end();

      /*obs.onNext({progress: 1, total:positions.length})
      obs.onNext(geometry)*/
    };
    worker.onerror = function (event) {
      error('filename:' + event.filename + ' lineno: ' + event.lineno + ' error: ' + event.message);
      //obs.onError(`filename:${event.filename} lineno: ${event.lineno} error: ${event.message}`)
    };
    worker.postMessage({ data: data });
    //obs.catch(e => worker.terminate())
    return function () {
      worker.terminate();
    };
  });

  return stream;
}

/*export function parse_old (data, parameters = {}) {
  const defaults = {
    useWorker: (detectEnv.isBrowser === true)
  }
  parameters = assign({}, defaults, parameters)
  const {useWorker} = parameters

  const obs = new Rx.ReplaySubject(1)

  if (useWorker) {
    // var Worker = require("./worker.js")//Webpack worker!
    // var worker = new Worker

    // TODO: for node.js side use https://github.com/audreyt/node-webworker-threads for similar speedups
    //or rather https://github.com/eugeneware/workerjs
    let worker = new Worker('./worker.js') // browserify
    worker.onmessage = function (event) {
      const positions = new Float32Array(event.data.positions)
      const normals = new Float32Array(event.data.normals)
      const geometry = {positions, normals}

      obs.onNext({progress: 1, total: positions.length, data: geometry})
      obs.onCompleted()
    }
    worker.onerror = function (event) {
      obs.onError(`filename:${event.filename} lineno: ${event.lineno} error: ${event.message}`)
    }

    worker.postMessage({data})
    obs.catch(e => worker.terminate())
  } else {
    try {
      let result = parseSteps(data)
      obs.onNext({progress: 1, total: result.positions.length, data: result})
      obs.onCompleted()
    } catch (error) {
      obs.onError(error)
    }
  }

  return obs
}*/
