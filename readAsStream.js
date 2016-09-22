let fileReaderStream = require('filereader-stream')

export default function readAsStream(file){

  fileReaderStream(file).pipe(function(data){
    console.log('here', data)
  })

  //concat(function(contents) {



}
