let fileReaderStream = require('filereader-stream')

export default function readAsStream (file) {
  return fileReaderStream(file, {chunkSize: 9999999999})
}
