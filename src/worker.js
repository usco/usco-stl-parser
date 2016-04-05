// importScripts('./stl-utils.js')
import { parseSteps } from './parseHelpers'

self.onmessage = function (event) {
  let result = parseSteps(event.data.data)

  let vertices = result.vertices.buffer
  let normals = result.normals.buffer
  self.postMessage({vertices: vertices, normals: normals}, [vertices, normals])
  self.close()
}
