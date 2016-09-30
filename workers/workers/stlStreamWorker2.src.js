import { default as makeStlStreamParser } from '../../parsers/stl/parseStreamAlt'
const stlStreamParser = makeStlStreamParser()

self.onmessage = function (event) {
  let _this = self
  function callback (err, data) {
    self.postMessage(data.buffer, [data.buffer])
  }
  console.log('event', Buffer(event.data))
  stlStreamParser(Buffer(event.data), null, (err, data) => self.postMessage(data.buffer, [data.buffer]))
}
