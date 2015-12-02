import assert from 'assert'
//import fs from 'fs' //does not work with babel + brfs
const fs = require('fs')

//these two are needed by the parser
//import Rx from 'rx'
//let Rx = require('rx')
import assign from 'fast.js/object/assign'
import parse, {outputs} from '../src/index' 
//import parse, {outputs}'../lib/stl-parser'


describe("STL parser", function() {
  //console.log("Parser outputs", outputs, parse)
  
  it("can parse ascii stl files", function(done) {
    this.timeout(5000)
    let data = fs.readFileSync("test/data/slotted_disk_ascii.stl",'binary')
    let stlObs = parse(data) //we get an observable back

    stlObs.forEach(function(parsedSTL){
      assert.equal(parsedSTL.vertices.length/3,864) //we divide by three because each entry is 3 long
      done()
    })
  })

  it("can parse binary stl files", done => {
    let data = fs.readFileSync("test/data/pr2_head_pan_bin.stl",'binary')
    let stlObs = parse(data) //we get an observable back

    stlObs.forEach(function(parsedSTL){
      assert.equal(parsedSTL.vertices.length/3,3000) //we divide by three because each entry is 3 long
      done()
    })
  })

  it("should handle errors gracefully", done => {
    let data = {foo:"42"}
    let stlObs = parse(data) //we get an observable back

    stlObs.forEach(undefined, function(error){
      assert.equal(error.message,"First argument to DataView constructor must be an ArrayBuffer")
      done()
    })
  })

})