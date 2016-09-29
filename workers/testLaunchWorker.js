var WebWorkify = require('webworkify')
var WorkerStream = require('workerstream')
const concat = require('concat-stream')
const through2 = require('through2')
var Readable = require('stream').Readable

// var worker = WebWorkify(require('./testWorker.js'))
/*const worker = new Worker('src/workers/testWorker.js')
var workerStream = WorkerStream(worker)

let dataSource = new Readable()
dataSource.push('beep ')
dataSource.push('boop\n')
dataSource.push(null)

const observer = function (chunk, enc, callback) {
  const textContent = chunk.toString('utf8')
  console.log('chunk in observer', textContent)
  callback(null, textContent)
}

const observer2 = function (chunk, enc, callback) {
  const textContent = chunk.toString('utf8')
  console.log('chunk in observer2', textContent)
  callback(null, textContent)
}

dataSource
  .pipe(through2(observer))
  .pipe(workerStream)
  .pipe(through2(observer2))
  .pipe(concat(function (data) {
    console.log('after workerStream', data)
  }))
*/

var stream = require('stream')
/*var stream = new Stream
stream.readable = true

var c = 64
var iv = setInterval(function () {
  if (++c >= 75) {
    clearInterval(iv)
    stream.emit('end')
  }
  else stream.emit('data', Buffer('foo') )//String.fromCharCode(c))
}, 100)

stream
.pipe(concat(function (data) {
  console.log('after testStream', data)
}))*/


const Duplex = require('stream').Duplex

class WorkerStream2 extends Duplex {
  constructor(path) {
    super()
    this.worker = typeof path === 'string'
      ? new Worker(path)
      : path
    this.worker.onmessage = this.workerMessage.bind(this)
    this.worker.onerror = this.workerError.bind(this)
  }

  workerMessage (e){
    this.emit('data', e.data, e)
  }

  workerError (err) {
    this.emit('error', err)
  }

  write (data, opts) {
    this.worker.postMessage(data, opts)
    return true
  }

  end () {
    this.emit('end')
  }

  _write(chunk, encoding, callback) {
  }

  _read(size) {}
}



let ws =  new WorkerStream2('src/workers/testWorker.js')

ws
.pipe(concat(function (data) {
  console.log('after testStream', data)
}))
ws.write( 'testSlug' )

/*workerStream.on('data', function(data) {
  console.log(data)
})
workerStream.on('error', function(e) { console.log('err', e)})*/

//workerStream.end()
