const through2 = require('through2')
const concat = require('concat-stream')
const Writable = require('stream').Writable
import { default as makeStlStreamParser } from './parsers/stl/parseStream'

import workerStreamParser from './workers/spawners/streamWorkerSpawner2'

export default function parseStlAsStreamWorker (fileReaderStream, files) {
  let startTime
  let endTime

  let accData
  let accPositions
  let accNormals

  const chunkSize = 512 // 1100

  function before(chunk, enc, callback) {
    console.log('here before worker', chunk)
    callback(null, chunk)
  }

  function after(chunk, enc, callback) {
    console.log('here after worker', chunk)
    callback(null, chunk)
  }

  const fileStream = fileReaderStream(files[0], {chunkSize: chunkSize * chunkSize})
  const wokerStreamer = workerStreamParser()
  startTime = new Date()

  let pipeline = fileStream
    //.pipe(through2(before))
    .pipe(wokerStreamer)
    //.pipe(through2(after))
    .pipe(concat(function (data) {
      //console.log('FUUUUend of data',data)
      accPositions = data.slice(0, data.length / 2)
      accNormals = data.slice(data.length / 2)

      accPositions = accPositions.buffer.slice(accPositions.byteOffset, accPositions.byteOffset + accPositions.byteLength)
      accNormals = accNormals.buffer.slice(accNormals.byteOffset, accNormals.byteOffset + accNormals.byteLength)

      // accPositions = new Float32Array(accPositions.buffer, accPositions.byteOffset, accPositions.byteLength / Float32Array.BYTES_PER_ELEMENT)
      // accNormals = new Float32Array(accNormals.buffer, accNormals.byteOffset, accNormals.byteLength / Float32Array.BYTES_PER_ELEMENT)

    }))
  pipeline.on('finish', function () {
    accData = {
      positions: accPositions,
      normals: accNormals
    }
    console.log('done', accData)
    endTime = new Date()
    console.log(`Mode: streaming, worker,  elapsed: `, endTime - startTime)
  })
}
