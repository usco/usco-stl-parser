//'use strict'
import { parseSteps } from './parseHelpers'

if(typeof self !== 'undefined'){
  console.log('I got self')
}

function process(event, self) {
  let result = parseSteps(event.data.data)

  let positions = result.positions.buffer
  let normals = result.normals.buffer

  console.log('here in stl parser worker')

  //console.log('results', 'buffer' in result.positions,  result.positions.buffer === null, result.positions.buffer.byteLength )
  self.postMessage({positions, normals}, [positions, normals])
  if('close' in self) {
    self.close()
  }
}
//module.exports = function () {
/*
  self.onmessage = function (event) {
    let result = parseSteps(event.data.data)

    let positions = result.positions.buffer
    let normals = result.normals.buffer

    console.log('here in stl parser worker')

    //console.log('results', 'buffer' in result.positions,  result.positions.buffer === null, result.positions.buffer.byteLength )
    self.postMessage({positions, normals}, [positions, normals])
    if('close' in self) {
      self.close()
    }
  }*/

//}
