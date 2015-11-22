stl format parser for USCO project, based on THREE.js STL parser


General information
-------------------
An "implicit" dependency for now is three.js (v70)
- for now it cannot be added to package.json since node's "require"
and three.js' heavy use of "instanceOf" break things ie

  geometry = new THREE.BufferGeometry() // in the local context
  
and later in engine this fails :

  geometry instanceof THREE.BufferGeometry
  

This repository contains both the:
- node.js version:
stl-parser.js at the root of the project



Usage with webpack
------------------

  just require / import the library (correctly points to stl-parser.js)

     /* { test: /-worker*\.js$/, loader: "worker-loader",include : pathsToInclude},//if any module does "require(XXX-worker)" it converts to a web worker*/
