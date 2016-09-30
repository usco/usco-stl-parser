import fileReaderStream from 'filereader-stream'
import readFileBasic from './readFileBasic'
import workerSpawner from './workers/workerSpawner'
import streamWorkerSpawner from './workers/streamWorkerSpawner'
import parseStlAsStreamNoWorker from './parseStlAsStreamNoWorker'
import parseStlAsStreamWorker from './parseStlAsStreamWorker'


var foo = require('./workers/testLaunchWorker')

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

  //repeat(testCount, testRunTransferable, files[0])
  //repeat(testCount, testRunCopy, files[0])
  //repeat(testCount, testRunStreamBlock, files[0])

  //parseStlAsStreamNoWorker(fileReaderStream, files)
  parseStlAsStreamWorker(fileReaderStream, files)
}

function handleDragOver (e) {
  e.stopPropagation()
  e.preventDefault()
  e.dataTransfer.dropEffect = 'copy' // Explicitly show this is a copy.
}

// Setup the dnd listeners.
var dropZone = document.getElementById('drop_zone')
dropZone.addEventListener('dragover', handleDragOver, false)
dropZone.addEventListener('drop', handleFileSelect, false)

console.log('dropZone', dropZone)
