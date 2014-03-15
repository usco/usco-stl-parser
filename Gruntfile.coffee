module.exports = (grunt) ->
  
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")
    currentBuild: null
    browserify:
      basic:
        src: ["./stl-parser.js"]
        dest: "lib/stl-parser.js"
        options:
          external: ["composite-detect","three"]
          alias: ["./stl-parser.js:stl-parser"]
          

  grunt.loadNpmTasks "grunt-browserify"
  
  # Task(s).
  grunt.registerTask "build-browser-lib", ["browserify"]
