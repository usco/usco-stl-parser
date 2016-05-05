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
 *  var parser = new STLParser()
 *  var loader = new THREE.XHRLoader( parser )
 *  loader.addEventListener( 'load', function ( event ) {
 *
 *    var geometry = event.content
 *    scene.add( new THREE.Mesh( geometry ) )
 *
 *  } )
 *  loader.load( './models/stl/slotted_disk.stl' )
 */

/*er = Rx.DOM.fromWebWorker('worker.js');

worker.subscribe(function (e) {
    console.log(e.data);
});

worker.onNext('some data');*/

// var detectEnv = require("composite-detect")
import detectEnv from 'composite-detect'
import assign from 'fast.js/object/assign'
import Rx from 'rx'

import { parseSteps } from './parseHelpers'

export const outputs = ['geometry'] // to be able to auto determine data type(s) fetched by parser

import Worker from 'workerjs'

/*export default function parse (data, parameters = {}) {
  const worker$ = fromWebWorker('./worker.js')
  worker$.onNext({data})

  return worker$
    .map(function (event) {
      const positions = new Float32Array(event.data.positions)
      const normals = new Float32Array(event.data.normals)
      // obs.onCompleted()
      obs.onNext({progress: 1, total: positions.length, data: {positions, normals}})
    })
    .catch(function (event) {
      return `filename:${event.filename} lineno: ${event.lineno} error: ${event.message}`
      // e => worker.terminate() ????
    })
}*/

export default function parse (data, parameters = {}) {
  const obs = new Rx.ReplaySubject(1)
  const worker = new Worker(__dirname + '/worker.js', true)

  worker.onmessage = function (event) {
    const positions = new Float32Array(event.data.positions)
    const normals = new Float32Array(event.data.normals)

    obs.onNext({progress: 1, total: positions.length, data: {positions, normals}})
    obs.onCompleted()
  }
  worker.onerror = function (event) {
    obs.onError(`filename:${event.filename} lineno: ${event.lineno} error: ${event.message}`)
  }

  worker.postMessage({data})
  obs.catch(e => worker.terminate())

  return obs
}

/*export function parse_old (data, parameters = {}) {
  const defaults = {
    useWorker: (detectEnv.isBrowser === true)
  }
  parameters = assign({}, defaults, parameters)
  const {useWorker} = parameters

  const obs = new Rx.ReplaySubject(1)

  if (useWorker) {
    // var Worker = require("./worker.js")//Webpack worker!
    // var worker = new Worker

    // TODO: for node.js side use https://github.com/audreyt/node-webworker-threads for similar speedups
    //or rather https://github.com/eugeneware/workerjs
    let worker = new Worker('./worker.js') // browserify
    worker.onmessage = function (event) {
      const positions = new Float32Array(event.data.positions)
      const normals = new Float32Array(event.data.normals)
      const geometry = {positions, normals}

      obs.onNext({progress: 1, total: positions.length, data: geometry})
      obs.onCompleted()
    }
    worker.onerror = function (event) {
      obs.onError(`filename:${event.filename} lineno: ${event.lineno} error: ${event.message}`)
    }

    worker.postMessage({data})
    obs.catch(e => worker.terminate())
  } else {
    try {
      let result = parseSteps(data)
      obs.onNext({progress: 1, total: result.positions.length, data: result})
      obs.onCompleted()
    } catch (error) {
      obs.onError(error)
    }
  }

  return obs
}*/
