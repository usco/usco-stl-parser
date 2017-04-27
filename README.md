# usco-stl-parser

> Fast and efficient [stl](https://en.wikipedia.org/wiki/STL_(file_format)) format parser

[![GitHub version](https://badge.fury.io/gh/usco%2Fusco-stl-parser.svg)](https://badge.fury.io/gh/usco%2Fusco-stl-parser)

[![Build Status](https://travis-ci.org/usco/usco-stl-parser.svg?branch=master)](https://travis-ci.org/usco/usco-stl-parser)
[![Dependency Status](https://david-dm.org/usco/usco-stl-parser.svg)](https://david-dm.org/usco/usco-stl-parser)
[![devDependency Status](https://david-dm.org/usco/usco-stl-parser/dev-status.svg)](https://david-dm.org/usco/usco-stl-parser#info=devDependencies)


- Optimized for speed (webworkers)
- And low memory consumption (streams)
- works in Node.js & browser
- there is currently no support for backpressure


## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Contribute](#contribute)
- [License](#license)


## Install


```
npm i @usco/stl-parser
```

## Usage


```JavaScript
  import makeParsedStream from '@usco/stl-parser'

  //for binary stl files
  fs.createReadStream('./someFile.stl', { encoding: null})
    .pipe(makeParsedStream({concat: true}))
    .on('data', function (parsed) {
      console.log('parsed', parsed)
      //DO what you want with the data
    })

  //for ascii stl files
  fs.createReadStream('./someFile.stl')
    .pipe(makeParsedStream({concat: true}))
    .on('data', function (parsed) {
      console.log('parsed', parsed)
      //DO what you want with the data
    })
```


## API

- returns a node.js stream containing geometric (positions & normals) data in TypedArrays (Float32Array)
- useable both on Node.js & client side

works something like this

raw data stream => raw chunks => | worker | => parsed chunks => concat

only exports a single function:

### makeParsedStream(options)
  * options.useWorker use web workers (browser only) defaults to true in browser
  * options.concat (default: true) when set to true, stream outputs a single value with all combined data , ie the whole mesh data:
  this is the default and it what you usually want to use



## Contribute

See [the contribute file](contribute.md)!

PRs accepted.

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

Code is written in the standard style.

[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

## License

[MIT © Mark Moissette](./LICENSE)
