//importScripts('./stl-utils.js');
//import {ensureBinary,ensureString} from './utils'
//import {parseBinary,parseASCII} from './parseHelpers'

var utils   = require('./utils')
var helpers = require('./parseHelpers')

self.onmessage = function( event ) {
  var data = event.data
  data = data.data
  data = ensureBinary( data )
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

}
