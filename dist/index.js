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
exports.default = makeParsedStream;

var _compositeDetect = require('composite-detect');

var _compositeDetect2 = _interopRequireDefault(_compositeDetect);

var _workerSpawner = require('./workerSpawner');

var _workerSpawner2 = _interopRequireDefault(_workerSpawner);

var _parseStream = require('./parseStream');

var _parseStream2 = _interopRequireDefault(_parseStream);

var _through = require('through2');

var _through2 = _interopRequireDefault(_through);

var _combining = require('combining');

var _combining2 = _interopRequireDefault(_combining);

var _concatStream2 = _interopRequireDefault(_concatStream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * parses and return a stream of parsed stl data
 * @param {Object} parameters parameters for the parser
 * @param {Boolean} parameters.useWorker use web workers (browser only) defaults to true in browser
 * @param {Boolean} parameters.concat when set to true, stream outputs a single value with all combined data
 * @return {Object} stream of parsed stl data in the form {positions:TypedArray, normals:TypedArray}
 */
function makeParsedStream() {
  var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var defaults = {
    useWorker: _compositeDetect2.default.isBrowser === true,
    concat: true
  };
  parameters = Object.assign({}, defaults, parameters);
  var _parameters = parameters,
      useWorker = _parameters.useWorker,
      concat = _parameters.concat;


  var mainStream = useWorker ? (0, _workerSpawner2.default)() : (0, _through2.default)((0, _parseStream2.default)());
  // concatenate result into a single one if needed (still streaming)
  var endStream = concat ? (0, _combining2.default)()(mainStream, (0, _concatStream2.default)()) : mainStream;

  return endStream;
}