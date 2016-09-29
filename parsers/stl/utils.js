export function ensureString (buf) {
  //console.log('ensureString')
  if (typeof buf !== 'string') {
    //console.log('forcing string', buf)
    var array_buffer = new Uint8Array(buf)
    var str = ''
    for (var i = 0; i < buf.byteLength; i++) {
      str += String.fromCharCode(array_buffer[i]) // implicitly assumes little-endian
    }
    return str
  } else {
    //console.log('already string')
    return buf
  }
}

export function ensureBinary (buf) {
  //console.log('ensureBinary')
  if (typeof buf === 'string') {
    //console.log('forcing binary')
    var array_buffer = new Uint8Array(buf.length)
    for (var i = 0; i < buf.length; i++) {
      array_buffer[i] = buf.charCodeAt(i) & 0xff // implicitly assumes little-endian
    }
    return array_buffer.buffer || array_buffer
  } else {
    //console.log('already binary')
    return buf
  }
}

export function isDataBinary (data) {
  console.log('data is binary ?')
  var expect, face_size, n_faces, reader
  reader = new DataView(data)
  face_size = (32 / 8 * 3) + ((32 / 8 * 3) * 3) + (16 / 8)

  n_faces = reader.getUint32(80, true)
  expect = 80 + (32 / 8) + (n_faces * face_size)
  return expect === reader.byteLength
}

//a more robust version of the above, that does NOT require the whole file
export function isDataBinaryRobust (data) {
  //console.log('data is binary ?')
  const patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g
  const text =  ensureString(data)
  const isBinary = patternVertex.exec(text) === null
  return isBinary
}
