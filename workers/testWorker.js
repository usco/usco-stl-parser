self.onmessage = function(event) {
  console.log('event', event)
  self.postMessage(event.data)
}
/*var ParentStream = require('workerstream/parent')
const through2 = require('through2')
const concat = require('concat-stream')

const observer = function (chunk, enc, callback) {
  console.log('here')
  //console.log('chunk inside worker', chunk.toString('utf8'))
  callback()//callback(null, enc)
}

module.exports = function(){
  var parentStream = ParentStream()
  //parentStream.pipe(somewhereAwesome).pipe(parentStream)
  parentStream
    .pipe(concat(function(data){
      console.log('data in worker',data)
    }))
    //.pipe(through2(observer))
    //.pipe(parentStream)
}*/
