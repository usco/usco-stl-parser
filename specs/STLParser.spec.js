THREE = require("three");
STLParser = require("../STLParser");
fs = require("fs");

describe("STL parser tests", function() {
  var parser = new STLParser();
  console.log("Parser outputs", parser.outputs);
  
  it("can parse ascii stl files", function() {
    data = fs.readFileSync("specs/data/slotted_disk_ascii.stl",'binary')
    parsedSTL = parser.parse(data);
    expect(parsedSTL instanceof THREE.Geometry).toBe(true);
    expect(parsedSTL.vertices.length).toEqual(864);
  });

  it("can parse binary stl files", function() {
    data = fs.readFileSync("specs/data/pr2_head_pan_bin.stl",'binary')
    parsedSTL = parser.parse(data);
    expect(parsedSTL instanceof THREE.Geometry).toBe(true);
    expect(parsedSTL.vertices.length).toEqual(3000);
  });

  
  
});
