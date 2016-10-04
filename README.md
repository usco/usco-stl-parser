## Usco-stl-parser: stl format parser

[![GitHub version](https://badge.fury.io/gh/usco%2Fusco-stl-parser.svg)](https://badge.fury.io/gh/usco%2Fusco-stl-parser)

Optimized for speed in the browser (webworkers etc), and low memory consumption (using node.js streams)

Disclaimer: was based a long long time ago on the Three.js STL parser, but has little left of the original code


## General information

  - returns a node.js stream containing geometric (positions & normals) data in TypedArrays (Float32Array)
  - useable both on Node.js & client side

## Usage


    import makeStlStream from 'usco-stl-parser'
    import concat from 'concat-stream' // just for demo purposes, helps to get the whole result data


    fs.createReadStream('./PATH/TO/mesh.stl')//get a readstream of our raw data
      .pipe(makeStlStream())// here is the magic
      .pipe(concat(function (data) {
        //Data is packed half/half for positions and normals
        let positions = data.slice(0, data.length / 2)
        let normals = data.slice(data.length / 2)

        positions = new Float32Array(positions.buffer.slice(positions.byteOffset, positions.byteOffset + positions.byteLength)) //
        normals = new Float32Array(normals.buffer.slice(normals.byteOffset, normals.byteOffset + normals.byteLength))
        const parsedSTL = {
          positions: positions,
          normals: normals
        }

        //DO what you want with the data wich is something like {vertices,normals,etc}
        console.log(parsedSTL)
      }})


## TODO

  - [ ] add support for backpressure (work in progress)

## LICENSE

[The MIT License (MIT)](https://github.com/usco/usco-stl-parser/blob/master/LICENSE)

- - -

[![Build Status](https://travis-ci.org/usco/usco-stl-parser.svg?branch=master)](https://travis-ci.org/usco/usco-stl-parser)
[![Dependency Status](https://david-dm.org/usco/usco-stl-parser.svg)](https://david-dm.org/usco/usco-stl-parser)
[![devDependency Status](https://david-dm.org/usco/usco-stl-parser/dev-status.svg)](https://david-dm.org/usco/usco-stl-parser#info=devDependencies)
