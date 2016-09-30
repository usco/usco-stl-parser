import { isDataBinaryRobust, ensureBinary, ensureString } from './utils'

export default function makeStlStreamParser () {
  let chunkNb = 0
  let totalSize = 0
  let isBinary = false

  let faceOffset = 0
  let previousRemainderData

  const parser = function (chunk, enc, callback) {
    console.log('chunk', chunk.length, chunkNb)
    if (chunkNb === 0) {
      isBinary = isDataBinaryRobust(chunk.buffer)
    }
    const workChunk = ensureBinary(previousRemainderData ? Buffer.concat([previousRemainderData, chunk]) : chunk)

    const {remainingDataInChunk, startOffset} = isBinary ? computeBinaryOffset(workChunk, chunkNb) : computASCIIOffset(workChunk, chunkNb)

    const parsed = isBinary ? parseBinaryChunk(faceOffset, remainingDataInChunk, startOffset, workChunk) : parseASCIIChunk(workChunk)
    // console.log('faceOffset', faceOffset, 'facesInChunk', facesInChunk, 'remainderDataLength', remainderDataLength, 'current face ', face)

    // update size
    chunkNb += 1
    totalSize += chunk.length

    previousRemainderData = parsed.remainderData
    faceOffset = parsed.faceOffset

    // we can only send a single buffer out , so concat the two
    const positionsBuffer = toBuffer(parsed.positions)
    const normalsBuffer = toBuffer(parsed.normals)
    // console.log('positions', positionsBuffer.length, parsed.positions.length)
    console.log('done with chunk', positionsBuffer, callback)
    callback(null, Buffer.concat([positionsBuffer, normalsBuffer]))
  }

  return parser
}

// helper function, taken from https://github.com/feross/typedarray-to-buffer
function toBuffer (arr) {
  var buf = new Buffer(arr.buffer)
  if (arr.byteLength !== arr.buffer.byteLength) {
    // Respect the "view", i.e. byteOffset and byteLength, without doing a copy
    buf = buf.slice(arr.byteOffset, arr.byteOffset + arr.byteLength)
  }
  return buf
}

function computeBinaryOffset (workChunk, chunkNb) {
  const dataStartOffset = 84
  const remainingDataInChunk = chunkNb === 0 ? workChunk.length - dataStartOffset : workChunk.length
  const startOffset = chunkNb === 0 ? dataStartOffset : 0

  return {remainingDataInChunk, startOffset}
}

function computASCIIOffset (workChunk, chunkNb) {
  return {remainingDataInChunk: workChunk.length, startOffset: 0}
}

function parseBinaryChunk (faceOffset, remainingDataInChunk, startOffset, workChunk) {
  // console.log('faces', faces, 'chunk size', chunk.length, 'workChunk', workChunk.length)
  // process all faces data that we can
  const faceLength = 12 * 4 + 2
  const facesInChunk = Math.floor(remainingDataInChunk / faceLength)

  const reader = new DataView(workChunk.buffer)
  const faces = reader.getUint32(80, true)
  let positions = new Float32Array(facesInChunk * 3 * 3)
  let normals = new Float32Array(facesInChunk * 3 * 3)

  let lface = 0
  let offset = 0

  // console.log(`Faces: ${facesInChunk}/${faces}`)

  for (let face = faceOffset; face < facesInChunk + faceOffset; face += 1) {
    let start = startOffset + lface * faceLength
    for (var i = 1; i <= 3; i++) {
      let vertexstart = start + i * 12
      positions[ offset ] = reader.getFloat32(vertexstart, true)
      positions[ offset + 1 ] = reader.getFloat32(vertexstart + 4, true)
      positions[ offset + 2 ] = reader.getFloat32(vertexstart + 8, true)

      normals[ offset ] = reader.getFloat32(start, true)
      normals[ offset + 1 ] = reader.getFloat32(start + 4, true)
      normals[ offset + 2 ] = reader.getFloat32(start + 8, true)
      offset += 3
    }
    lface += 1
  }

  // compute offsets, remainderData etc for next chunk etc
  const remainderData = workChunk.slice(workChunk.length - remainingDataInChunk % faceLength) // chunk length - remainderDataLength

  return {faceOffset: lface, remainderData, positions, normals}
}

// ASCII stl parsing
export function parseASCIIChunk (workChunk) {
  const data = ensureString(workChunk)
  // console.log('parseASCII')
  let result, text
  const patternNormal = /normal[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g
  const patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g
  const patternFace = /facet([\s\S]*?)endfacet/g

  let posArray = []
  let normArray = []

  let faces = 0
  let offset = 0

  while ((result = patternFace.exec(data)) !== null) {
    var length = 0

    text = result[0]
    offset = result.index + text.length

    while ((result = patternNormal.exec(text)) !== null) {
      normArray.push(parseFloat(result[ 1 ]), parseFloat(result[ 3 ]), parseFloat(result[ 5 ]))
      normArray.push(parseFloat(result[ 1 ]), parseFloat(result[ 3 ]), parseFloat(result[ 5 ]))
      normArray.push(parseFloat(result[ 1 ]), parseFloat(result[ 3 ]), parseFloat(result[ 5 ]))
    }

    while ((result = patternVertex.exec(text)) !== null) {
      posArray.push(parseFloat(result[ 1 ]), parseFloat(result[ 3 ]), parseFloat(result[ 5 ]))
      length += 1
    }
    faces += 1
  }

  let positions = new Float32Array(faces * 3 * 3)
  let normals = new Float32Array(faces * 3 * 3)

  positions.set(posArray)
  normals.set(normArray)

  // compute offsets, remainderData etc for next chunk etc
  const remainderTextData = data.slice(offset)
  // console.log('remainderData', remainderTextData)
  const remainderData = new Buffer(remainderTextData)
  return {faceOffset: faces, remainderData, positions, normals}
}
