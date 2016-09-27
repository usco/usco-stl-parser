import parseSteps from './parsers/stl/parseHelpers.js'

self.onmessage = function (event) {
  //console.log('event',event.data)
  let result = parseSteps(event.data.buffer)

  let positions = result.positions.buffer
  let normals = result.normals.buffer

  //console.log('here in parser worker')

  // console.log('results', 'buffer' in result.positions,  result.positions.buffer === null, result.positions.buffer.byteLength )
  self.postMessage({positions, normals}, [positions, normals])
  if ('close' in self) {
    self.close()
  }


}
