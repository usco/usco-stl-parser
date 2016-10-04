import test from 'ava'
// import fs from 'fs' //does not work with babel + brfs
const fs = require('fs')

import makeStlStream from '../src/index'
import concat from 'concat-stream'

test.cb('STL parser tests: can parse ascii stl files', t => {
  // this.timeout(5000)
  fs.createReadStream('./data/slotted_disk_ascii.stl', { encoding: null, highWaterMark: 512 * 1024 }) // 'binary'
    .pipe(makeStlStream())
    .pipe(concat(function (data) {
      let positions = data.slice(0, data.length / 2)
      let normals = data.slice(data.length / 2)

      positions = new Float32Array(positions.buffer.slice(positions.byteOffset, positions.byteOffset + positions.byteLength)) //
      normals = new Float32Array(normals.buffer.slice(normals.byteOffset, normals.byteOffset + normals.byteLength))
      const parsedSTL = {
        positions: positions,
        normals: normals
      }
    //.on('data', function (parsedSTL) {
      t.deepEqual(parsedSTL.positions.length / 3, 864) // we divide by three because each entry is 3 long
      t.end()
    }))
})

test.cb('STL parser tests: can parse binary stl files', t => {
   fs.createReadStream('./data/pr2_head_pan_bin.stl')
    .pipe(makeStlStream()) // we get a stream back
    .pipe(concat(function (data) {
      let positions = data.slice(0, data.length / 2)
      let normals = data.slice(data.length / 2)

      positions = new Float32Array(positions.buffer.slice(positions.byteOffset, positions.byteOffset + positions.byteLength)) //
      normals = new Float32Array(normals.buffer.slice(normals.byteOffset, normals.byteOffset + normals.byteLength))
      const parsedSTL = {
        positions: positions,
        normals: normals
      }
      t.deepEqual(parsedSTL.positions.length / 3, 3000) // we divide by three because each entry is 3 long
      t.end()
    }))
    /*.on('data', function (parsedSTL) {
      t.deepEqual(parsedSTL.positions.length / 3, 3000) // we divide by three because each entry is 3 long
      t.end()
    })*/
})

/*test.cb('STL parser tests: should handle errors gracefully', t => {
  let data = {foo: '42'}
  let stlObs = parse(data) // we get an observable back

  stlObs.forEach(undefined, function (error) {
    t.deepEqual(error.message, 'First argument to DataView constructor must be an ArrayBuffer')
    t.end()
  })
})*/
