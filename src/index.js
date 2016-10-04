/**
 * @author kaosat-dev / https://github.com/kaosat-dev
 * @author aleeper / http://adamleeper.com/
 * @author mrdoob / http://mrdoob.com/
 * @author gero3 / https://github.com/gero3
 *
 * Description: A streaming (node.js streams) parser for STL ASCII files & BINARY,
 * as created by Solidworks and other CAD programs. Optimised both for speed and low memory consumption
 *
 * Supports both binary and ASCII encoded files, with automatic detection of type.
 *
 * Limitations:
 *  Binary decoding ignores header. There doesn't seem to be much of a use for it.
 *  There is perhaps some question as to how valid it is to always assume little-endian-ness.
 *  ASCII decoding assumes file is UTF-8. Seems to work for the examples...
 *
 * Usage:
**/

import detectEnv from 'composite-detect'
import workerSpawner from './workerspawner'
import makeStreamParser from './parseStream'
import through2 from 'through2'

//import concat from 'concat-stream'

export default function makeStlStream (parameters = {}) {
  const defaults = {
    useWorker: (detectEnv.isBrowser === true)
  }
  parameters = Object.assign({}, defaults, parameters)
  const {useWorker} = parameters

  const parseStep = useWorker ? workerSpawner() : through2(makeStreamParser())

  // console.log('parseStep', parseStep
  return parseStep
    /*.pipe(concat(function (data) {
      console.log('FUUUUend of data', data.length)
      let positions = data.slice(0, data.length / 2)
      let normals = data.slice(data.length / 2)

      positions = new Float32Array(positions.buffer.slice(positions.byteOffset, positions.byteOffset + positions.byteLength)) //
      normals = new Float32Array(normals.buffer.slice(normals.byteOffset, normals.byteOffset + normals.byteLength))
      return {
        positions: positions,
        normals: normals
      }
    }))*/
}
