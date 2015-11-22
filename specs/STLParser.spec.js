import assert from 'assert';
import Rx from 'rx'
import fs from 'fs'

import parse,  {outputs} from '../lib/stl-parser'
//import from '../lib/stl-parser'
//var pars = require('../lib/stl-parser')

//console.log("STLParser",STLParser)

describe("STL parser", function() {
  //console.log("Parser outputs", outputs, parse)
  
  it("can parse ascii stl files", function() {
    let data = fs.readFileSync("specs/data/slotted_disk_ascii.stl",'binary')
    parsedSTL = parse(data)
    console.log("parsedSTL",parsedSTL)
    //expect(parsedSTL instanceof THREE.Geometry).toBe(true)
    //expect(parsedSTL.vertices.length).toEqual(864)
  })
   /*it(`should have 'run'`, done => {
      assert.strictEqual(typeof run, `function`);
      done();
    });*/

  /*it("can parse binary stl files", function() {
    data = fs.readFileSync("specs/data/pr2_head_pan_bin.stl",'binary')
    parsedSTL = parser.parse(data)
    expect(parsedSTL instanceof THREE.Geometry).toBe(true)
    expect(parsedSTL.vertices.length).toEqual(3000)
  })*/
})