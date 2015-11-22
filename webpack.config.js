var path = require('path')
var webpack = require('webpack')


console.log("__dirname",__dirname)
var ROOT_PATH  = './' //path.resolve(__dirname);
var APP_PATH   = path.join(__dirname, 'src','index')//path.resolve(ROOT_PATH, 'src');
var BUILD_PATH = path.join(__dirname, 'lib')//path.resolve(ROOT_PATH, 'lib');


var babelLoader  = { test: /\.js?$/, exclude: /(node_modules)/,query: {presets: ['es2015']},loader: 'babel-loader'}
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
  },
  module:{
    loaders: [
      babelLoader
      ,workerLoader
    ]
  },
  worker: {
    output: {
      filename: "stl-worker.js",
      chunkFilename: "[id].hash.worker.js"
    }
  }

 
}