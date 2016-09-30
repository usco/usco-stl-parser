var ParentStream = require('workerstream/parent')
const through2 = require('through2')
const concat = require('concat-stream')
import { default as makeStlStreamParser } from '../parsers/stl/parseStream'

const observer = function (chunk, enc, callback) {
  console.log('chunk inside worker', chunk.toString('utf8'))
  callback(null, Buffer(chunk)) // callback(null, enc)
}

module.exports = function () {
  var parentStream = ParentStream()
  parentStream
    .pipe(through2(observer))
    //.pipe(makeStlStreamParser())
    /*.pipe(concat(function (data) {
      console.log('data in worker', data)
    }))*/
    .pipe(parentStream)
}

/*function arrayBufferToString (buffer) {
  var arr = new Uint8Array(buffer)
  var str = String.fromCharCode.apply(String, arr)
  if (/[\u0080-\uffff]/.test(str)) {
    throw new Error('this string seems to contain (still encoded) multibytes')
  }
  return str
}

self.onmessage = function (event) {
  const inboundMessage = arrayBufferToString(event.data)
  self.postMessage(inboundMessage + 'through grinder')
}*/
