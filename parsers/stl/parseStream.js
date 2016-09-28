import { isDataBinary, ensureBinary, ensureString } from './utils'

// import through2 from 'through2'
var through2 = require('through2')

export default function makeStlStreamParser () {
  let chunkNb = 0
  let totalSize = 0
  let isBinary = false

  let faces = 0
  let positions
  let normals

  const dataStartOffset = 84
  const faceLength = 12 * 4 + 2
  const faceLengthByte = faceLength * 8

  let offset = 0
  let face = 0

  let faceOffset = 0

  let previousRemainderDataLength = 0
  let previousRemainderData

  const parser = function (chunk, enc, callback) {
    //console.log('chunk', chunk.length, chunkNb)
    let workChunk = previousRemainderData ? Buffer.concat([previousRemainderData, chunk]): chunk
    workChunk = ensureBinary(workChunk)
    const data = workChunk.buffer
    const reader = new DataView(data)

    let remainingDataInChunk = workChunk.length

    if (chunkNb === 0) {
      isBinary = isDataBinary(data)

      faces = reader.getUint32(80, true)
      // FIXME meh , we are allocating data for the whole thing: not great
      positions = new Float32Array(faces * 3 * 3)
      normals = new Float32Array(faces * 3 * 3)
      console.log('faces', faces, 'chunk size', chunk.length, 'workChunk', workChunk.length)
      remainingDataInChunk = workChunk.length - dataStartOffset
    }

    // process all faces data that we can
    // offset face => faces handled so far / faceLength

    let facesInChunk = Math.floor(remainingDataInChunk / faceLength)
    let remainderDataLength = remainingDataInChunk % faceLength

    for (face = faceOffset; face < facesInChunk + faceOffset; face += 1) {
      /*let start = dataStartOffset + face * faceLength
      for (var i = 1; i <= 3; i++) {
        let vertexstart = start + i * 12
        positions[ offset     ] = reader.getFloat32(vertexstart, true)
        positions[ offset + 1 ] = reader.getFloat32(vertexstart + 4, true)
        positions[ offset + 2 ] = reader.getFloat32(vertexstart + 8, true)

        normals[offset] = reader.getFloat32(start, true)
        normals[offset + 1] = reader.getFloat32(start + 4, true)
        normals[offset + 2] = reader.getFloat32(start + 8, true)
        offset += 3
      }*/
    }
    console.log('faceOffset',faceOffset,'facesInChunk', facesInChunk, 'remainderDataLength', remainderDataLength, 'current face ', face)

    // update size
    chunkNb += 1
    totalSize += chunk.length

    previousRemainderDataLength = remainderDataLength
    previousRemainderData = workChunk.slice(workChunk.length - remainderDataLength)
    faceOffset = face


    console.log('previousRemainderData', previousRemainderData)


    callback()

  // callback(null, `${fakeAccumulatedData}`)
  }

  return through2(parser)

// data = ensureBinary(data)
// const isBinary = isDataBinary(data)
// return isBinary ? parseBinary(data) : parseASCII(ensureString(data))
}

export function parseBinary (data) {
  var reader = new DataView(data)
  var faces = reader.getUint32(80, true)
  var dataStartOffset = 84
  var faceLength = 12 * 4 + 2
  var offset = 0

  var positions = new Float32Array(faces * 3 * 3)
  var normals = new Float32Array(faces * 3 * 3)

  for (var face = 0; face < faces; face++) {
    var start = dataStartOffset + face * faceLength

    for (var i = 1; i <= 3; i++) {
      var vertexstart = start + i * 12

      positions[ offset     ] = reader.getFloat32(vertexstart, true)
      positions[ offset + 1 ] = reader.getFloat32(vertexstart + 4, true)
      positions[ offset + 2 ] = reader.getFloat32(vertexstart + 8, true)

      normals[offset] = reader.getFloat32(start, true)
      normals[offset + 1] = reader.getFloat32(start + 4, true)
      normals[offset + 2] = reader.getFloat32(start + 8, true)
      offset += 3
    }
  }
  return {positions, normals}
}
