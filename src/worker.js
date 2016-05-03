// importScripts('./stl-utils.js')
import { parseSteps } from './parseHelpers'

self.onmessage = function (event) {
  let result = parseSteps(event.data.data)

  let positions = result.positions.buffer
  let normals = result.normals.buffer
  self.postMessage({positions, normals}, [positions, normals])
  self.close()
}
