/**
 * @author aleeper / http://adamleeper.com/
 * @author mrdoob / http://mrdoob.com/
 * @author gero3 / https://github.com/gero3
 * @author kaosat-dev / https://github.com/kaosat-dev
 *
 * Description: A THREE parser for STL ASCII files & BINARY, as created by Solidworks and other CAD programs.
 *
 * Supports both binary and ASCII encoded files, with automatic detection of type.
 *
 * Limitations:
 *  Binary decoding ignores header. There doesn't seem to be much of a use for it.
 *  There is perhaps some question as to how valid it is to always assume little-endian-ness.
 *  ASCII decoding assumes file is UTF-8. Seems to work for the examples...
 *
 * Usage:
 *  var parser = new STLParser();
 *  var loader = new THREE.XHRLoader( parser );
 *  loader.addEventListener( 'load', function ( event ) {
 *
 *    var geometry = event.content;
 *    scene.add( new THREE.Mesh( geometry ) );
 *
 *  } );
 *  loader.load( './models/stl/slotted_disk.stl' );
 */

//var detectEnv = require("composite-detect");
import detectEnv from 'composite-detect'
import assign from 'fast.js/object/assign'
import Rx from 'rx'

import {geometryFromBuffers
,parseASCII
,parseASCIIThree
,parseBinary
,parseBinaryThree } from './parseHelpers'
import {isDataBinary,ensureBinary,ensureString} from './utils'

export const outputs = ["geometry"] //to be able to auto determine data type(s) fetched by parser

export default function parse(data, parameters={}){

  const defaults = {
    useBuffers: true
    ,useWorker: (parameters.useBuffers ===true && detectEnv.isBrowser===true)
  }
  //var useWorker = parameters.useWorker !== undefined ?  parameters.useWorker && detectEnv.isBrowser: true
  parameters = assign({},defaults,parameters)
  const {useWorker,useBuffers} = parameters


  console.log("useWorker",useWorker,"useBuffers",useBuffers)

  const obs = new Rx.Subject()

  if ( useWorker ) {
    var Worker = require("./worker.js")//Webpack worker!
    //var worker = new Worker
    //let worker = new Worker( "./stl-worker.js" )//browserify

    worker.onmessage = function( event ) {
      const vertices = new Float32Array( event.data.vertices )
      const normals = new Float32Array( event.data.normals )
      const geometry = {vertices:vertices,normals:normals}
 
      obs.onNext({progress: 100, total:vertices.length}) 
      obs.onNext(geometry)
      obs.onCompleted()
    }
    worker.postMessage( {data:data})
    obs.catch(e=>worker.terminate()) 
  }
  else
  {
    console.log("here")
    data = ensureBinary( data )
    console.log("ensured data is binary")
    const isBinary = isDataBinary(data)
    console.log("is it binary",isBinary)
    if(!isBinary){
      data = ensureString( data )
    }
    
  
    if( isBinary )
    {
      if( useBuffers ){
        obs.onNext( geometryFromBuffers( parseBinary( data ) ) )
      }
      else{
        obs.onNext( parseBinaryThree( data ) )
      }
    }
    else{
      if( useBuffers ){
        obs.onNext( geometryFromBuffers( parseASCII( ensureString( data ) ) ) )
      }
      else{
        console.log("parsing")
        obs.onNext( parseASCIIThree( ensureString( data ) ) )
      }
    }
  }

  return obs
}


