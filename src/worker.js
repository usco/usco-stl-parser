//importScripts('./stl-utils.js');
import {parseASCII,parseBinary} from './parseHelpers'
import {isDataBinary,ensureBinary,ensureString} from './utils'

//var utils   = require('./utils')
//var helpers = require('./parseHelpers')


/*self.onmessage = function( event ) {
  //console.log("in worker")

  var data = event.data
  data = data.data
  data = utils.ensureBinary( data )
  var isBinary = utils.isDataBinary(data)
  if(!isBinary){
    data = utils.ensureString( data )
  }
  
  var result = null
  if( isBinary )
  {
    result = helpers.parseBinary( data )
  }
  else{ 
    result = helpers.parseASCII( data ) 
  }

  var vertices = result.vertices.buffer
  var normals =  result.normals.buffer
  self.postMessage( {vertices:vertices, normals:normals}, [vertices,normals] )
	self.close()
}*/

self.onmessage = function( event ) {
  let data = ensureBinary( event.data.data )
  const isBinary = isDataBinary(data)

  let result = null
  if( isBinary )
  {
    result = parseBinary( data )
  }
  else{ 
    result = ensureString( parseASCII( data ) )
  }

  let vertices = result.vertices.buffer
  let normals =  result.normals.buffer
  self.postMessage( {vertices:vertices, normals:normals}, [vertices,normals] )
  self.close()

}
