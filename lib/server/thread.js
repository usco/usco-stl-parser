'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = thread;
function thread(path) {
  var browser = true;
  if (browser) {
    var worker = new Worker('./worker.js');
    return worker;
  } else {
    var _ret = function () {
      var exec = require('child_process').exec;
      var cmd = require(path);
      console.log('cmd', cmd, path);
      var child = exec(cmd);

      var wrapper = {};
      child.stdout.on('data', function (data) {
        // console.log("stdout",data)
        wrapper.onmessage(data);
      });
      child.stderr.on('data', function (data) {
        wrapper.onerror(data);
      });
      /*child.on('close', function (code) {
      })*/
      return {
        v: wrapper
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  }
}