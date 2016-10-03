import fileReaderStream from 'filereader-stream'
import readFileBasic from './readFileBasic'
import workerSpawner from './workers/spawners/workerSpawner'
import streamWorkerSpawner from './workers/spawners/streamWorkerSpawner'
import parseStlAsStreamNoWorker from './parseStlAsStreamNoWorker'
import parseStlAsStreamWorker from './parseStlAsStreamWorker'

// var foo = require('./workers/spawners/testSpawnWorker')

// helper for file size display from http://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
function formatBytes (bytes, decimals) {
  if (bytes === 0) return '0 Byte'
  var k = 1000 // or 1024 for binary
  var dm = decimals + 1 || 3
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  var i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// not worker based, for dev/testing
import { default as makeStlStreamParser } from './parsers/stl/parseStream'
function repeat (times, fn, params) {
  for (var i = 0; i < times; i++) {
    fn(params)
  }
}

function handleFileSelect (e) {
  e.stopPropagation()
  e.preventDefault()

  // files is a FileList of File objects. List some properties.
  let files = []
  for (var i = 0, f; f = e.dataTransfer.files[i]; i++) {
    files.push(f)
  }
  let output = files.map(function (f) {
    return `<li>
      <strong> ${escape(f.name)} </strong> (${f.type || 'n/a' }) - ${f.size} bytes,
      last modified: ${f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a'}
      </li>`
  })

  document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>'

  const testCount = 1

  function testRunTransferable () {
    readFileBasic(files[0]).then(workerSpawner.bind(null, {transferable: true}))
  }

  function testRunCopy () {
    readFileBasic(files[0]).then(workerSpawner.bind(null, {transferable: false}))
  }

  function testRunStreamBlock () {
    const concat = require('concat-stream')

    const workerStream = streamWorkerSpawner.bind(null, {transferable: false})()
    fileReaderStream(files[0], {chunkSize: 9999999999}).pipe(workerStream)
  /*.pipe(concat(function(data) {
    console.log('after worker')
  }))*/
  }

  function testRunStream () {
  }

  console.log(`Results for file size: ${formatBytes(files[0].size)}`)

  repeat(testCount, testRunTransferable, files[0])
  // repeat(testCount, testRunCopy, files[0])
  // repeat(testCount, testRunStreamBlock, files[0])

  // parseStlAsStreamNoWorker(fileReaderStream, files)
  parseStlAsStreamWorker(fileReaderStream, files)
}

function handleDragOver (e) {
  e.stopPropagation()
  e.preventDefault()
  e.dataTransfer.dropEffect = 'copy' // Explicitly show this is a copy.
}

// Setup the dnd listeners.
let dropZone = document.getElementById('drop_zone')
dropZone.addEventListener('dragover', handleDragOver, false)
dropZone.addEventListener('drop', handleFileSelect, false)
