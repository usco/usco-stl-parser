export default function readFileBasic (file) {

  return new Promise(function (resolve, reject) {
    const reader = new FileReader()

    reader.onload = function (openFile) {
      const fileData = openFile.target.result
      //console.log('openFile', openFile.target.result)
      resolve(fileData)
    }
    reader.readAsArrayBuffer(file)
  })
}
