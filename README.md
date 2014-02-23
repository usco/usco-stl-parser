stl format parser for USCO project, based on THREE.js STL parser


General information
-------------------
This repository contains both the:
- node.js version:
stl-parser.js at the root of the project
- polymer.js/browser version which is a combo of
lib/stl-parser.js (browserified version of the above)
stl-parser.html


How to generate browser/polymer.js version (with require support):
------------------------------------------------------------------
Type: 

    browserify stl-parser.js -r ./stl-parser.js:stl-parser -o lib/stl-parser.js -x composite-detect -x three

then replace (manually for now) all following entries in the generated file:

  "composite-detect":"awZPbp","three":"Wor+Zu"

with the correct module names, ie:

   "composite-detect":"composite-detect","three":"three"
