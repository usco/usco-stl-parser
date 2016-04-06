export function ensureString (buf) {
  if (typeof buf !== 'string') {
    var array_buffer = new Uint8Array(buf)
    var str = ''
    for (var i = 0; i < buf.byteLength; i++) {
      str += String.fromCharCode(array_buffer[i]) // implicitly assumes little-endian
    }
    return str
  } else {
    return buf
  }
}

export function ensureBinary (buf) {
  if (typeof buf === 'string') {
    var array_buffer = new Uint8Array(buf.length)
    for (var i = 0; i < buf.length; i++) {
      array_buffer[i] = buf.charCodeAt(i) & 0xff // implicitly assumes little-endian
    }
    return array_buffer.buffer || array_buffer
  } else {
    return buf
  }
}

export function isDataBinary (data) {
  var expect, face_size, n_faces, reader
  reader = new DataView(data)
  face_size = (32 / 8 * 3) + ((32 / 8 * 3) * 3) + (16 / 8)

  n_faces = reader.getUint32(80, true)
  expect = 80 + (32 / 8) + (n_faces * face_size)
  return expect === reader.byteLength
}
