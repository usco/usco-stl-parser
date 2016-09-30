const Duplex = require('stream').Duplex
const WebWorkify = require('webworkify')

class WorkerStream extends Duplex {
  constructor (path) {
    super()
    this.worker = typeof path === 'string' ? new Worker(path) : path

    this.bufferedData = undefined
    this.requestedDataQueue = []

    this.worker.onmessage = (e) => {
      const data = Buffer(e.data)
      this.push(data)
      /*this.bufferedData = this.bufferedData ? Buffer.concat([this.bufferedData, data]) : data

      if (this.requestedDataQueue.length > 0) {
        const size = this.requestedDataQueue[0]
        const reqChunk = this.bufferedData.slice(0, size)
        this.push(reqChunk) // actual emits requested chunk size

        this.bufferedData = this.bufferedData.slice(size)
        this.requestedDataQueue.shift()
      }*/
    }

    this.worker.onerror = (err) => {
      this.emit('error', err)
    }
  }

  end (data) {
    console.log('here')
    this.emit('end')
  }

  _write (chunk, encoding, callback) {
    // console.log('_write',chunk.toString('utf8'),'to worker')
    this.worker.postMessage(chunk.buffer, [chunk.buffer])
    callback()
  }

  _read (size) {
    // console.log('consumer asking read', size)
    this.requestedDataQueue.push(size)
  }
}

export default function workerStreamParser () {
  //const worker = WebWorkify(require('./stlStreamWorker.js'))
  const worker = 'src/workers/stlStreamWorker.js'
  const ws = new WorkerStream(worker)
  return ws
}
