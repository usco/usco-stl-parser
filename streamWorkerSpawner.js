const Workerstream = require('workerstream')
const Writable = require('stream').Writable


export default function streamWorkerSpawner (params, rawData) {
  console.log('runing a streaming worker')
  const {transferable} = params
  const mode = transferable ? 'streaming transferable' : 'streaming copy'
  let startTime
  let endTime

  const worker = Workerstream('src/worker2.js')

  worker.on('data', function(data) {
    console.log(data)
    endTime = new Date()

    console.log(`Mode: ${mode},  elapsed: `, endTime - startTime)
  })
  worker.on('error', function(e) {
    console.log('err', e)
  })

  /*const data = rawData

  if (transferable) {
    console.log('sending data to streaming worker in transferable mode')
    worker.write(data, [data])
  } else {
    console.log('sending data to streaming worker in copy mode')
    worker.write(data)
  }*/
  startTime = new Date()
  return worker
}
