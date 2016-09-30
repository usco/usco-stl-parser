var WebWorkify = require('webworkify')
var WorkerStream = require('workerstream')
const concat = require('concat-stream')
const through2 = require('through2')
var Readable = require('stream').Readable

// var worker = WebWorkify(require('./testWorker.js'))
const worker = new Worker('src/workers/testWorker.js')
var workerStream = WorkerStream(worker)

let dataSource = new Readable()
dataSource.push('beep')
dataSource.push('boop')
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

/*dataSource
  .pipe(through2(observer))
  .pipe(workerStream)
  .pipe(through2(observer2))
  .pipe(concat(function (data) {
    console.log('after workerStream', data)
  }))*/


const Duplex = require('stream').Duplex

class WorkerStream2 extends Duplex {
  constructor(path) {
    super()
    this.worker = typeof path === 'string'
      ? new Worker(path)
      : path

    this.bufferedData = undefined
    this.requestedDataQueue = []

    this.worker.onmessage = (e) => {
      const data = Buffer(e.data)

      this.bufferedData = this.bufferedData ? Buffer.concat([this.bufferedData, data]) : data

      if(this.requestedDataQueue.length > 0){
        const size = this.requestedDataQueue[0]
        const reqChunk = this.bufferedData.slice(0, size)
        this.push(reqChunk)//actual emits requested chunk size

        this.bufferedData = this.bufferedData.slice(size)
        this.requestedDataQueue.shift()
      }
    }

    this.worker.onerror = (err) => {
      this.emit('error', err)
    }
  }

  _write(chunk, encoding, callback) {
    //console.log('_write',chunk.toString('utf8'),'to worker')
    this.worker.postMessage(chunk.buffer, [chunk.buffer])
    callback()
  }

  _read(size) {
    //console.log('consumer asking read', size)
    this.requestedDataQueue.push(size)
  }
}


let ws =  new WorkerStream2('src/workers/testWorker.js')

dataSource
  .pipe(through2(observer))
  .pipe(ws)
  .pipe(through2(observer2))
  .pipe(concat(function (data) {
    console.log('after testStream', data)
  }))

//ws.write( 'testSlug' )

/*workerStream.on('data', function(data) {
  console.log(data)
})
workerStream.on('error', function(e) { console.log('err', e)})*/

//workerStream.end()
