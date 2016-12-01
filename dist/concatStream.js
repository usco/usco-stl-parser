'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = concatStream;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Duplex = require('stream').Duplex;
//stream-combiner2
// a lot of this is taken from https://github.com/maxogden/concat-stream, with gratitude!

function isArrayish(arr) {
  return (/Array\]$/.test(Object.prototype.toString.call(arr))
  );
}

function isBufferish(p) {
  return typeof p === 'string' || isArrayish(p) || p && typeof p.subarray === 'function';
}

function bufferConcat(parts) {
  var bufs = [];
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i];
    if (Buffer.isBuffer(p)) {
      bufs.push(p);
    } else if (isBufferish(p)) {
      bufs.push(new Buffer(p));
    } else {
      bufs.push(new Buffer(String(p)));
    }
  }
  return Buffer.concat(bufs);
}

function customConcat(parts) {
  var positionBufs = [];
  var normalBufs = [];

  for (var i = 0; i < parts.length; i++) {
    var p = parts[i];
    if (Buffer.isBuffer(p)) {
      var positions = p.slice(0, p.length / 2);
      var normals = p.slice(p.length / 2);
      positionBufs.push(positions);
      normalBufs.push(normals);
    }
  }

  var pBuf = Buffer.concat(positionBufs);
  var nBuf = Buffer.concat(normalBufs);

  return {
    positions: new Float32Array(pBuf.buffer.slice(pBuf.byteOffset, pBuf.byteOffset + pBuf.byteLength)),
    normals: new Float32Array(nBuf.buffer.slice(nBuf.byteOffset, nBuf.byteOffset + nBuf.byteLength))
  };
}

var Formatter = function (_Duplex) {
  _inherits(Formatter, _Duplex);

  function Formatter(processorFn) {
    _classCallCheck(this, Formatter);

    var _this = _possibleConstructorReturn(this, (Formatter.__proto__ || Object.getPrototypeOf(Formatter)).call(this, { readableObjectMode: true }));

    _this.body = [];
    _this.on('finish', function () {
      var result = processorFn(customConcat(this.body));
      this.push(result);
      this.emit('end');
    });
    return _this;
  }

  _createClass(Formatter, [{
    key: '_read',
    value: function _read(size) {}
  }, {
    key: '_write',
    value: function _write(chunk, encoding, callback) {
      this.body.push(chunk);
      callback();
    }
  }, {
    key: 'end',
    value: function end() {
      var self = this;
      setTimeout(function () {
        return self.emit('finish');
      }, 0.001); // WTH ??withouth this, finish is emitted too early
    }
  }]);

  return Formatter;
}(Duplex);

function concatStream(processorFn) {
  return new Formatter(processorFn);
}