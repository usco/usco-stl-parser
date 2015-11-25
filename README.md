stl format parser for USCO project

originally based on THREE.js STL parser, but rather extensively modified.

Optimized for speed in the browser (webworkers)


General information
-------------------

  - returns raw buffer data wrapped in an RxJs observable (soon to be most.js)
  - useable both on Node.js & client side 


Usage 
------------------

  
          import parse,  {outputs} from '../lib/stl-parser'

          let data = fs.readFileSync("mesh.stl",'binary')

          let stlObs = parse(data) //we get an observable back

          stlObs.forEach(function(parsedSTL){
            //DO what you want with the data wich is something like {vertices,normals,etc}
            console.log(parsedSTL) 
          })
