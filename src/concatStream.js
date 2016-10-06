const Duplex = require('stream').Duplex
//stream-combiner2
// a lot of this is taken from https://github.com/maxogden/concat-stream, with gratitude!

function isArrayish (arr) {
  return /Array\]$/.test(Object.prototype.toString.call(arr))
}

function isBufferish (p) {
  return typeof p === 'string' || isArrayish(p) || (p && typeof p.subarray === 'function')
}

function bufferConcat (parts) {
  var bufs = []
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i]
    if (Buffer.isBuffer(p)) {
      bufs.push(p)
    } else if (isBufferish(p)) {
      bufs.push(new Buffer(p))
    } else {
      bufs.push(new Buffer(String(p)))
    }
  }
  return Buffer.concat(bufs)
}

class Formatter extends Duplex {
  constructor (processorFn) {
    super({readableObjectMode: true})
    this.body = []
    this.on('finish', function () {
      const result = processorFn(bufferConcat(this.body))
      this.push(result)
      this.emit('end')
    })
  }

  _read (size) {}

  _write (chunk, encoding, callback) {
    this.body.push(chunk)
    callback()
  }

  end () {
    const self = this
    setTimeout(() => self.emit('finish'), 0.001) // WTH ??withouth this, finish is emitted too early
  }
}

export default function concatStream (processorFn) {
  return new Formatter(processorFn)
}
