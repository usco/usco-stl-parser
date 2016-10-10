import test from 'ava'
// import fs from 'fs' //does not work with babel + brfs
const fs = require('fs')

import makeStlStream from '../src/index'
import concatStream from '../src/concatStream'

test.cb('STL parser tests: can parse ascii stl files', t => {
  // this.timeout(5000)
  fs.createReadStream('./data/slotted_disk_ascii.stl', { encoding: null, highWaterMark: 512 * 1024 }) // 'binary'
    .pipe(makeStlStream())
    .pipe(concatStream(function (parsedSTL) {
      t.deepEqual(parsedSTL.positions.length / 3, 864) // we divide by three because each entry is 3 long
      t.deepEqual(parsedSTL.positions[0], -0.025066649541258812)
      t.deepEqual(parsedSTL.positions[parsedSTL.positions.length - 1], 0.019999999552965164)
      t.end()
    }))
})

test.cb('STL parser tests: can parse binary stl files', t => {
  fs.createReadStream('./data/pr2_head_pan_bin.stl')
    .pipe(makeStlStream()) // we get a stream back
    .pipe(concatStream(function (parsedSTL) {
      t.deepEqual(parsedSTL.positions.length / 3, 3000) // we divide by three because each entry is 3 long
      t.deepEqual(parsedSTL.positions[0], -0.07563293725252151)
      t.deepEqual(parsedSTL.positions[parsedSTL.positions.length - 1], 0.07198309153318405)
      t.end()
    }))
})

/*test.cb('STL parser tests: should handle errors gracefully', t => {
  let data = {foo: '42'}
  let stlObs = parse(data) // we get an observable back

  stlObs.forEach(undefined, function (error) {
    t.deepEqual(error.message, 'First argument to DataView constructor must be an ArrayBuffer')
    t.end()
  })
})*/
