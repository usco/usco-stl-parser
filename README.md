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
- polymer.js/browser version which is a combo of
lib/stl-parser.js (browserified version of the above)
stl-parser.html


How to generate browser/polymer.js version (with require support):
------------------------------------------------------------------
Type: 

    grunt build-browser-lib

This will generate the correct browser(ified) version of the source in the lib folder


Usage with webpack
------------------

  just require / import the library (correctly points to stl-parser.js)
