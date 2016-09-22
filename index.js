import readAsStream from './readAsStream'

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


  readAsStream(_files[0])
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
