import WorkerStream from './WorkerStream'
import WebWorkify from 'webWorkify'

export default function workerSpawner () {
  //const worker = new Worker('./stlStreamWorker.src.js')
  const worker = WebWorkify(require('./stlStreamWorker.js'))
  const ws = new WorkerStream(worker)
  return ws
}
