'use strict';

var _parseStream = require('./parseStream');

var _parseStream2 = _interopRequireDefault(_parseStream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (self) {
  var stlStreamParser = (0, _parseStream2.default)();

  self.onmessage = function (event) {
    // stlStreamParser(event.data, null, (err, data) => self.postMessage(data.buffer, [data.buffer]))
    stlStreamParser(Buffer(event.data), null, function (err, data) {
      return self.postMessage(data.buffer, [data.buffer]);
    });
  };
};