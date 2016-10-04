import WorkerStream from './WorkerStream'

export default function workerSpawner () {
  // const worker = WebWorkify(require('../workers/stlStreamWorker2.src.js'))
  const worker = 'src/workers/workers/stlStreamWorker2.js'
  const ws = new WorkerStream(worker)
  return ws
}
