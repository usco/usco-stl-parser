import makeStlStreamParser from './parseStream'

module.exports = function (self) {
  const stlStreamParser = makeStlStreamParser()

  self.onmessage = function (event) {
    // stlStreamParser(event.data, null, (err, data) => self.postMessage(data.buffer, [data.buffer]))
    stlStreamParser(Buffer(event.data), null, (err, data) => self.postMessage(data.buffer, [data.buffer]))
  }
}
