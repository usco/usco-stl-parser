export default function thread (path) {
  let browser = false
  if (browser) {
    //const worker = new Worker('./worker.js')
    const worker = {}
    return worker
  } else {
    console.log('command line')
    const exec = require('child_process').exec
    //const cmd = require(path)
    console.log('cmd', cmd, path)
    let child = exec(path)

    let wrapper = {
      postMessage: function (data) {
        console.log('postMessage')
      },
      onmessage: function (data) {
        console.log('onmessage')
      },
      onerror: function (error) {
        console.log('onerror')
      }
    }
    child.stdout.on('data', function (data) {
      console.log("stdout",data)
      wrapper.onmessage(data)
    })
    child.stderr.on('data', function (data) {
      wrapper.onerror(data)
    })
    /*child.on('close', function (code) {
    })*/
    return wrapper
  }
}
