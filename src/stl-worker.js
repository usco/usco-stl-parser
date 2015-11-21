//importScripts('./stl-utils.js');
var stlUtils = require("./stl-utils.js")


self.onmessage = function( event ) {
  var data = event.data
  data = data.data
  data = stlUtils.ensureBinary( data )
  var isBinary = stlUtils.isBinary(data)
  if(!isBinary){
    data = stlUtils.ensureString( data )
  }
  
  var result = null
  if( isBinary )
  {
    result = stlUtils.parseBinary( data )
  }
  else{ 
    result = stlUtils.parseASCII( data ) 
  }

  var vertices = result.vertices.buffer
  var normals =  result.normals.buffer
  self.postMessage( {vertices:vertices, normals:normals}, [vertices,normals] )
	self.close()

}
