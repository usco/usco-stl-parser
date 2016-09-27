import { isDataBinary, ensureBinary, ensureString } from './utils'

//import through2 from 'through2'
var through2 = require('through2')

export default function makeStlStreamParser () {
  let chunkNb = 0
  let totalSize = 0
  let isBinary = false

  let faces = 0
  let positions
  let normals

  const dataOffset = 84
  const faceLength = 12 * 4 + 2
  let offset = 0
  let face = 0

  let fakeAccumulatedData = []


  const parser =  function (chunk, enc, callback) {
    /*for (var i = 0; i < chunk.length; i++)
      if (chunk[i] === 97)
        chunk[i] = 122 // swap 'a' for 'z'*/
    console.log('chunk', chunk.length, chunkNb)
    chunk = ensureBinary(chunk)
    const data = chunk.buffer
    const reader = new DataView(data)

    let remainingDataInChunk = 0

    if (chunkNb === 0) {
      isBinary = isDataBinary(data)

      faces = reader.getUint32(80, true)
      //FIXME meh , we are allocating data for the whole thing: not great
      //positions = new Float32Array(faces * 3 * 3)
      //normals = new Float32Array(faces * 3 * 3)
      console.log('faces', faces)
      remainingDataInChunk = chunk.length - dataOffset
    }

    //start = dataOffset + face * faceLength
    //vertexstart = start + i * 12

    // update size
    chunkNb += 1
    totalSize += chunk.length

    fakeAccumulatedData.push(chunkNb)


    callback(null, `${fakeAccumulatedData}`)
  }

  return through2(parser)

  // data = ensureBinary(data)
  // const isBinary = isDataBinary(data)
  // return isBinary ? parseBinary(data) : parseASCII(ensureString(data))
}

export function parseBinary (data) {
  var reader = new DataView(data)
  var faces = reader.getUint32(80, true)
  var dataOffset = 84
  var faceLength = 12 * 4 + 2
  var offset = 0

  var positions = new Float32Array(faces * 3 * 3)
  var normals = new Float32Array(faces * 3 * 3)

  for (var face = 0; face < faces; face++) {
    var start = dataOffset + face * faceLength

    for (var i = 1; i <= 3; i++) {
      var vertexstart = start + i * 12

      positions[ offset     ] = reader.getFloat32( vertexstart, true )
      positions[ offset + 1 ] = reader.getFloat32( vertexstart + 4, true )
      positions[ offset + 2 ] = reader.getFloat32( vertexstart + 8, true )

      normals[offset] = reader.getFloat32(start, true)
      normals[offset + 1] = reader.getFloat32(start + 4, true)
      normals[offset + 2] = reader.getFloat32(start + 8, true)
      offset += 3
    }
  }
  return {positions, normals}
}
