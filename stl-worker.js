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


self.onmessage = function( event ) {
  var data = event.data;
  //data = self.ensureBinary(data );
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

  self.postMessage( {vertices:vertices, normals:normals} );
	self.close();

}
