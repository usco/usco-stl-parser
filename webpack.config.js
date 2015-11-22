var path = require('path')
var webpack = require('webpack')

//,query: {presets: ['es2015']}
var ROOT_PATH  = './' //path.resolve(__dirname);
var APP_PATH   = path.join(__dirname, 'src','index')//path.resolve(ROOT_PATH, 'src');
var BUILD_PATH = path.join(__dirname, 'lib')//path.resolve(ROOT_PATH, 'lib');

var babelLoader  = { test: /\.js?$/, exclude: /(node_modules)/,loader: 'babel-loader'}
var workerLoader = { test: /worker*\.js$/, loader: "worker-loader"}//,include : pathsToInclude}//if any module does "require(XXX-worker)" it converts to a web worker

module.exports = {
  entry: APP_PATH,
  output: {
    path: BUILD_PATH
    ,filename: 'stl-parser.js'
    ,library: 'stlParser'
    ,libraryTarget: 'commonjs2'
  },
  externals: {
    'rx':'Rx'
    //,'fast.js/object/assign':'assign'
  },
  module:{
    loaders: [
      workerLoader
      ,babelLoader//keep this order !!!
    ]
  },
  worker: {
    output: {
      filename: "stl-worker.js",
      chunkFilename: "[id].hash.worker.js"
    }
  }

 
}