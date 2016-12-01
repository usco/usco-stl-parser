'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.concatStream = undefined;

var _concatStream = require('./concatStream');

Object.defineProperty(exports, 'concatStream', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_concatStream).default;
  }
});
exports.default = makeStlStream;

var _compositeDetect = require('composite-detect');

var _compositeDetect2 = _interopRequireDefault(_compositeDetect);

var _workerSpawner = require('./workerSpawner');

var _workerSpawner2 = _interopRequireDefault(_workerSpawner);

var _parseStream = require('./parseStream');

var _parseStream2 = _interopRequireDefault(_parseStream);

var _through = require('through2');

var _through2 = _interopRequireDefault(_through);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeStlStream() {
  var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var defaults = {
    useWorker: _compositeDetect2.default.isBrowser === true
  };
  parameters = Object.assign({}, defaults, parameters);
  var _parameters = parameters,
      useWorker = _parameters.useWorker;


  return useWorker ? (0, _workerSpawner2.default)() : (0, _through2.default)((0, _parseStream2.default)());
}