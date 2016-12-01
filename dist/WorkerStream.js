'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Duplex = require('stream').Duplex;

/* utility to wrap a web worker and turn it into a stream*/

var WorkerStream = function (_Duplex) {
  _inherits(WorkerStream, _Duplex);

  function WorkerStream(path) {
    _classCallCheck(this, WorkerStream);

    var _this = _possibleConstructorReturn(this, (WorkerStream.__proto__ || Object.getPrototypeOf(WorkerStream)).call(this));

    _this.worker = typeof path === 'string' ? new Worker(path) : path;

    _this.requests = 0;
    _this.responses = 0;
    _this.doneWriting = false;

    _this.bufferedData = undefined;
    _this.requestedDataQueue = [];

    _this.requestedTotal = 0;
    _this.sentTotal = 0;

    _this.worker.onmessage = function (e) {
      //this._dealWithData(e)

      var data = Buffer(e.data);
      _this.push(data);
      _this.responses += 1;
      _this._done();
    };

    _this.worker.onerror = function (err) {
      _this.emit('error', err);
    };
    return _this;
  }

  _createClass(WorkerStream, [{
    key: '_dealWithData',
    value: function _dealWithData(e) {
      if (e) {
        var data = Buffer(e.data);
        //console.log('recieved', this.requests)
        this.bufferedData = this.bufferedData ? Buffer.concat([this.bufferedData, data]) : data;
      }

      if (this.bufferedData && this.requestedDataQueue.length > 0) {
        var size = this.requestedDataQueue[0];
        var reqChunk = this.bufferedData.slice(0, size);
        this.push(reqChunk); // actual emits requested chunk size

        this.bufferedData = this.bufferedData.slice(size);
        this.sentTotal += reqChunk.length;
        console.log('sentTotal', this.sentTotal);
        this.requestedDataQueue.shift();
        //console.log(this.requestedDataQueue.length)
        //this.responses += 1
      }
      this._done();
    }
  }, {
    key: '_done',
    value: function _done() {
      //if (this.requestedDataQueue.length === 0 && this.doneWriting)
      if (this.requests === this.responses && this.doneWriting) {
        //
        //console.log('done FOR REALZ')
        this.emit('end');
      }
    }
  }, {
    key: 'end',
    value: function end(data) {
      this.doneWriting = true;
      //console.log('done writing', this.requests, this.responses)
      this._done();
    }
  }, {
    key: '_write',
    value: function _write(chunk, encoding, callback) {
      // console.log('_write',chunk.toString('utf8'),'to worker')
      this.requests += 1;
      this.worker.postMessage(chunk.buffer, [chunk.buffer]);

      callback(null, chunk);
    }
  }, {
    key: '_read',
    value: function _read(size) {
      // console.log('consumer asking read', size)
      this.requestedDataQueue.push(size);
      this.requestedTotal += size;
      //console.log('requestedTotal',this.requestedTotal)

      //this._dealWithData()
    }
  }]);

  return WorkerStream;
}(Duplex);

exports.default = WorkerStream;