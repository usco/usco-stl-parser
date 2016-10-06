import WorkerStream from './WorkerStream'
import WebWorkify from 'WebWorkify'
//import foo from './foo'
export default function workerSpawner () {
  //const worker = new Worker('./stlStreamWorker.src.js')
  const worker = WebWorkify(require('./stlStreamWorker.src.js'))
  const ws = new WorkerStream(worker)
  return ws
}
