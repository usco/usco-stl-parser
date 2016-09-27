/*function parseSteps (data) {
  return {
    positions: new ArrayBuffer(1),//data.size), //[0, 1, 2],
    normals: new ArrayBuffer(2)//data.size),//[2, 1, 0]
  }
}*/
import parseSteps from '../parsers/stl/parseHelpers.js'

self.onmessage = function (event) {
  //console.log('event',event.data)
  const result = parseSteps(event.data)

  let positions = result.positions.buffer
  let normals = result.normals.buffer

  //console.log('here in parser worker')

  // console.log('results', 'buffer' in result.positions,  result.positions.buffer === null, result.positions.buffer.byteLength )
  self.postMessage({positions, normals}, [positions, normals])
  if ('close' in self) {
    self.close()
  }
}
