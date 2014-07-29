self.ensureBinary =function(buf){

	if (typeof buf === "string"){
		var array_buffer = new Uint8Array(buf.length);
		for(var i = 0; i < buf.length; i++) {
			array_buffer[i] = buf.charCodeAt(i) & 0xff; // implicitly assumes little-endian
		}
		return array_buffer.buffer || array_buffer;
	} else {
		return buf;
	}

}


self.parseASCII = function( data ) {

  var normal, patternFace, patternNormal, patternVertex, result, text;
	patternFace = /facet([\s\S]*?)endfacet/g;

  var posArray = [];
  var normArray = [];
  var indicesArray = [];
  var faces = 0;
  
	while ( ( result = patternFace.exec( data ) ) !== null ) {
    var length = 0;
    
		text = result[0];
		patternNormal = /normal[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

		while ( ( result = patternNormal.exec( text ) ) !== null ) {
      normArray.push( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) );
      normArray.push( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) );
      normArray.push( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) );
		}

		patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

		while ( ( result = patternVertex.exec( text ) ) !== null ) {

      posArray.push( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) );
      length += 1;
		}
		faces +=1;
	}

  var vertices = new Float32Array( faces * 3 * 3 );
	var normals = new Float32Array( faces * 3 * 3 );
	
	vertices.set( posArray );
	normals.set ( normArray );

  return {vertices: vertices, normals:normals};
}

self.parseBinary = function( data )
{
  var reader = new DataView( data );
	var faces = reader.getUint32( 80, true );
	var dataOffset = 84;
	var faceLength = 12 * 4 + 2;

	var offset = 0;
  
  
  var vertices = new Float32Array( faces * 3 * 3 );
	var normals = new Float32Array( faces * 3 * 3 );

	for ( var face = 0; face < faces; face ++ ) {

		var start = dataOffset + face * faceLength;

		for ( var i = 1; i <= 3; i ++ ) {

			var vertexstart = start + i * 12;

			vertices[ offset     ] = reader.getFloat32( vertexstart, true );
			vertices[ offset + 1 ] = reader.getFloat32( vertexstart + 4, true );
			vertices[ offset + 2 ] = reader.getFloat32( vertexstart + 8, true );

			normals[ offset     ] = reader.getFloat32( start    , true );
			normals[ offset + 1 ] = reader.getFloat32( start + 4, true );
			normals[ offset + 2 ] = reader.getFloat32( start + 8, true );
			offset += 3;
		}
	}
	return {vertices: vertices, normals:normals};
}

self.onmessage = function( event ) {
  var data = event.data;
  //data = self.ensureBinary(data );
  var isBinary = data.isBinary;
  data = data.data;
  var result = null;
  if( isBinary )
  {
    result = self.parseBinary( data );
  }
  else{ result = self.parseASCII( data ) };

  var vertices = result.vertices.buffer;
  var normals =  result.normals.buffer;
  self.postMessage( {vertices:vertices, normals:normals}, [vertices,normals] );
	self.close();

}
