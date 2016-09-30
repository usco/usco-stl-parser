const through2 = require('through2')
const concat = require('concat-stream')
const Writable = require('stream').Writable
import { default as makeStlStreamParser } from './parsers/stl/parseStream'

export default function parseStlAsStreamNoWorker (fileReaderStream, files) {
  const record = function (chunk, enc, callback) {
    // console.log('here', chunk, enc, callback)
    // this.push(chunk)
    callback(null, chunk)
  }

  let startTime
  let endTime

  let accData
  let accPositions
  let accNormals
  const bucketTest = new Writable({
    write: function (chunk, encoding, next) {
      console.log('chunk', chunk.length)
      let positions = chunk.slice(0, chunk.length / 2)
      let normals = chunk.slice(chunk.length / 2)

      accPositions = accPositions ? Buffer.concat([accPositions, positions]) : positions
      accNormals = accNormals ? Buffer.concat([accNormals, normals]) : normals
      // console.log('positions', positions)
      next()
    }
  })

  // [512,1024,]
  const chunkSize = 1024 // 1100

  const fileStream = fileReaderStream(files[0], {chunkSize: chunkSize * chunkSize})
  startTime = new Date()
  let pipeline = fileStream
    // .pipe(through2(record))
    .pipe(makeStlStreamParser())
    // .pipe(bucketTest)
    .pipe(concat(function (data) {
      // console.log('end of data',data)
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
    console.log(`Mode: streaming, no worker,  elapsed: `, endTime - startTime)
  })
}
