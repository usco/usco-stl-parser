export default function workerSpawner (params, rawData) {
  const {transferable} = params
  const mode = transferable ? 'standard transferable' : 'standard copy'
  const worker = new Worker('src/workers/workers/worker.js')
  let startTime
  let endTime

  worker.onmessage = function (event) {
    console.log('recieved data from worker', event.data)
    //console.log('on message', event.data)
    //console.log('data size', event.data.positions.byteLength)
    // const positions = new Float32Array(event.data.positions)
    // const normals = new Float32Array(event.data.normals)
    endTime = new Date()

    console.log(`Mode: ${mode},  elapsed: `, endTime - startTime)
  }

  worker.onerror = function (event) {
    console.error(event)
  // console.error(`filename:${event.filename} lineno: ${event.lineno} error: ${event.message}`)
  }

  // let data = {size: 999999999, data: rawData} // 1048576*128}
  const data = rawData
  //console.log('rawData', rawData)
  startTime = new Date()

  if (transferable) {
    console.log('sending data to worker in transferable mode')
    worker.postMessage(data, [data])
  } else {
    console.log('sending data to worker in copy mode')
    worker.postMessage(data)
  }
}
