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
import workerSpawner from './workerSpawner'
import makeStreamParser from './parseStream'
import through2 from 'through2'
import combine from 'combining'

// re-export for api
export { default as concatStream } from './concatStream'
import concatStream from './concatStream'


/**
 * parses and return a stream of parsed stl data
 * @param {Object} parameters parameters for the parser
 * @param {Boolean} parameters.useWorker use web workers (browser only) defaults to true in browser
 * @param {Boolean} parameters.concat when set to true, stream outputs a single value with all combined data
 * @return {Object} stream of parsed stl data in the form {positions:TypedArray, normals:TypedArray}
 */
export default function makeStlStream (parameters = {}) {
  const defaults = {
    useWorker: (detectEnv.isBrowser === true),
    concat: true
  }
  parameters = Object.assign({}, defaults, parameters)
  const {useWorker, concat} = parameters

  const mainStream = useWorker ? workerSpawner() : through2(makeStreamParser())
  // concatenate result into a single one if needed (still streaming)
  const endStream = concat ? combine()(mainStream, concatStream()) : mainStream

  return endStream
}
