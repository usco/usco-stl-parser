



export default function thread(path){
  let browser = true
  if(browser){
    const worker = new Worker('./worker.js')
    return worker
  }else{
    const exec = require('child_process').exec
    const cmd = require(path)
    console.log('cmd',cmd, path)
    let child = exec(cmd)

    let wrapper = {

    }
    child.stdout.on('data', function (data) {
      // console.log("stdout",data)
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
