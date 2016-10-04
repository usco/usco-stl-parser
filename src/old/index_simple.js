const worker = new Worker('src/worker.js')
let startTime
let endTime

worker.onmessage = function (event) {
  console.log('on message', event.data)
  console.log('data size', event.data.positions.byteLength)
  // const positions = new Float32Array(event.data.positions)
  // const normals = new Float32Array(event.data.normals)
  endTime = new Date()
}

worker.onerror = function (event) {
  console.error(event)
// console.error(`filename:${event.filename} lineno: ${event.lineno} error: ${event.message}`)
}

let data = {size: 999999999} // 1048576*128}
startTime = new Date()
worker.postMessage(data)//, [data])

// file input handling, mostly taken from http://www.html5rocks.com/en/tutorials/file/dndfiles/

function readFileData(file){
  let reader = new FileReader()

}
function handleFileSelect (e) {
  e.stopPropagation()
  e.preventDefault()

  var files = e.dataTransfer.files // FileList object.

  // files is a FileList of File objects. List some properties.
  let _files = []
  for (var i = 0, f; f = files[i]; i++){
    _files.push(f)
  }
  let output = _files.map(function(f){
    return `<li>
      <strong> ${escape(f.name)} </strong> (${f.type || 'n/a' }) - ${f.size} bytes,
      last modified: ${f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a'}
      </li>`
  })

  console.log('output', output)
  document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>'
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
