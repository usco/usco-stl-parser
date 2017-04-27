import test from 'ava'
const fs = require('fs')
const path = require('path')

import makeParsedStream from '../src/index'

test.cb('STL parser tests: can parse ascii stl files', t => {
  fs.createReadStream(path.resolve(__dirname, 'data/slotted_disk_ascii.stl'), { encoding: null, highWaterMark: 512 * 1024 }) // 'binary'
    .pipe(makeParsedStream({concat: true}))
    .on('data', function (parsed) {
      t.deepEqual(parsed.positions.length / 3, 864) // we divide by three because each entry is 3 long
      t.deepEqual(parsed.positions[0], -0.025066649541258812)
      t.deepEqual(parsed.positions[parsed.positions.length - 1], 0.019999999552965164)
      t.end()
    })
})

test.cb('STL parser tests: can parse binary stl files', t => {
  fs.createReadStream(path.resolve(__dirname, 'data/pr2_head_pan_bin.stl'))
    .pipe(makeParsedStream({concat: true})) // we get a stream back, passing the concat: true option to get the final result only
    .on('data', function (parsed) {
      t.deepEqual(parsed.positions.length / 3, 3000) // we divide by three because each entry is 3 long
      t.deepEqual(parsed.positions[0], -0.07563293725252151)
      t.deepEqual(parsed.positions[parsed.positions.length - 1], 0.07198309153318405)
      t.end()
    })
})

/* test.cb('STL parser tests: should handle errors gracefully', t => {
  let data = {foo: '42'}
  let stlObs = parse(data) // we get an observable back

  stlObs.forEach(undefined, function (error) {
    t.deepEqual(error.message, 'First argument to DataView constructor must be an ArrayBuffer')
    t.end()
  })
}) */
