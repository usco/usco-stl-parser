import { default as makeStlStreamParser } from '../../parsers/stl/parseStreamAlt'
const stlStreamParser = makeStlStreamParser()

self.onmessage = function (event) {
  stlStreamParser(Buffer(event.data), null, (err, data) => self.postMessage(data.buffer, [data.buffer]))
}
