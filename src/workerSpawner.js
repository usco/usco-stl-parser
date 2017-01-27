import WorkerStream from './WorkerStream'
import webworkify from 'webworkify'

export default function workerSpawner () {
  //const worker = new Worker('./stlStreamWorker.src.js')
  const worker = webworkify(require('./worker.js'))
  const ws = new WorkerStream(worker)
  return ws
}
