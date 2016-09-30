const ParentStream = require('workerstream/parent')
import { default as makeStlStreamParser } from '../parsers/stl/parseStream'

module.exports = function () {
  console.log('here in worker')
  const stlStreamParser = makeStlStreamParser()
  var parentStream = ParentStream()
  parentStream
    .pipe(stlStreamParser)
    .pipe(parentStream)
}
