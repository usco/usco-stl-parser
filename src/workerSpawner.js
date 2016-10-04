import WorkerStream from './WorkerStream'

export default function workerSpawner () {
  // const worker = WebWorkify(require('.stlStreamWorker.src.js'))
  const worker = './stlStreamWorker.js'
  const ws = new WorkerStream(worker)
  return ws
}
