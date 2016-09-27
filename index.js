import readAsStream from './readAsStream'
import readFileBasic from './readFileBasic'
import workerSpawner from './workerSpawner'

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
    readAsStream(files[0])
  }

  repeat(testCount, testRunTransferable, files[0])
  repeat(testCount, testRunCopy, files[0])
  repeat(testCount, testRunStream, files[0])

// .then(e=>console.log('fileData', e))
// readAsStream(files[0])
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
