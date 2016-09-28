import fileReaderStream from 'filereader-stream'
import readFileBasic from './readFileBasic'
import workerSpawner from './workers/workerSpawner'
import streamWorkerSpawner from './workers/streamWorkerSpawner'

//not worker based, for dev/testing
import {default as makeStlStreamParser} from './parsers/stl/parseStream'
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

  function testRunTransferable(){
    readFileBasic(files[0]).then(workerSpawner.bind(null, {transferable: true}))
  }

  function testRunCopy(){
    readFileBasic(files[0]).then(workerSpawner.bind(null, {transferable: false}))
  }

  function testRunStream(){
    const workerStream =  streamWorkerSpawner.bind(null, {transferable: false})()
    fileReaderStream(files[0], {chunkSize: 9999999999}).pipe(workerStream)
  }

  repeat(testCount, testRunTransferable, files[0])
  repeat(testCount, testRunCopy, files[0])
  repeat(testCount, testRunStream, files[0])

  const through2 = require('through2')
  const concat = require('concat-stream')

  const record = function (chunk, enc, callback) {
    //console.log('here', chunk, enc, callback)
    //this.push(chunk)
    callback(null, chunk)
  }

  const Writable = require('stream').Writable

  let startTime
  let endTime

  const bucketTest = new Writable({
    write: function(chunk, encoding, next) {
      //console.log(chunk.toString())
      //console.log('chunk', chunk, chunk.length)
      next()
    }
  })


  const fileStream = fileReaderStream(files[0])
  startTime = new Date()
  let pipeline = fileStream
    //.pipe(through2(record))
    .pipe(makeStlStreamParser())
    .pipe(bucketTest)
    /*.pipe(concat(function(data) {
      console.log('end of data',data)
    }))*/
  pipeline.on('finish', function () {
    console.log('done')
    endTime = new Date()
    console.log(`Mode: streaming, no worker,  elapsed: `, endTime - startTime)
  })
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
