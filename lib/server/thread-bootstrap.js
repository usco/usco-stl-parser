'use strict';

var noop = function noop() {};
global.self = {
  postMessage: function postMessage(msg) {
    process.send(JSON.stringify({ data: msg }));
  },
  onmessage: noop,
  onerror: noop,
  addEventListener: function addEventListener(eventName, cb) {
    if (eventName === 'message') {
      global.onmessage = global.self.onmessage = cb;
    } else if (eventName === 'error') {
      global.onerror = global.self.onerror = cb;
    }
  }
};

global.importScripts = function () {
  var fs = require('fs');
  var path = require('path');
  var files = Array.prototype.slice.call(arguments);
  var script = files.map(function (file) {
    return fs.readFileSync(file, 'utf8');
  }).join('\n');
  var vm = require('vm');
  var script = vm.createScript(script);
  script.runInThisContext();
};

Object.keys(global.self).forEach(function (key) {
  global[key] = global.self[key];
});

process.on('message', function (msg) {
  var parsed = JSON.parse(msg);
  global.self.onmessage && global.self.onmessage(parsed);
});
process.on('error', function (err) {
  global.self.onerror && global.self.onerror(err);
});