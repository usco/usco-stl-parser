## Usco-stl-parser

stl format parser for USCO project

originally based on THREE.js STL parser, but rather extensively modified.
(not dependenant, or using three.js anymore)

Optimized for speed in the browser (webworkers etc)


## General information

  - returns raw buffer data wrapped in an RxJs observable (soon to be most.js)
  - useable both on Node.js & client side 


## Usage 

  
          import parse,  {outputs} from '../lib/stl-parser'

          let data = fs.readFileSync("mesh.stl",'binary')

          let stlObs = parse(data) //we get an observable back

          stlObs.forEach(function(parsedSTL){
            //DO what you want with the data wich is something like {vertices,normals,etc}
            console.log(parsedSTL) 
          })



## LICENSE

[The MIT License (MIT)](https://github.com/usco/usco-stl-parser/blob/master/LICENSE)

- - -

[![Build Status](https://travis-ci.org/usco/usco-stl-parser.svg?branch=master)](https://travis-ci.org/usco/usco-stl-parser)
[![Dependency Status](https://david-dm.org/usco/usco-stl-parser.svg)](https://david-dm.org/usco/usco-stl-parser)
[![devDependency Status](https://david-dm.org/usco/usco-stl-parser/dev-status.svg)](https://david-dm.org/usco/usco-stl-parser#info=devDependencies)