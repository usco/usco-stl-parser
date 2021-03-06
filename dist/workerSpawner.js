'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = workerSpawner;

var _WorkerStream = require('./WorkerStream');

var _WorkerStream2 = _interopRequireDefault(_WorkerStream);

var _webworkify = require('webworkify');

var _webworkify2 = _interopRequireDefault(_webworkify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function workerSpawner() {
  //const worker = new Worker('./stlStreamWorker.src.js')
  var worker = (0, _webworkify2.default)(require('./worker.js'));
  var ws = new _WorkerStream2.default(worker);
  return ws;
}