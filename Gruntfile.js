

/**
 * Grunt Buildfile for Cascading Tree Sheets
 *
 * To be used with GruntJS <http://gruntjs.com/>
 */
module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: "<json:package.json>",
    meta: {
      banner: "/**\n" +
              "* <%= pkg.name %>\n" +
              " * <%= pkg.description %>\n" +
              " *\n" +
              " * @author <%= pkg.author.name %> <<%= pkg.author.email %>>\n" +
              " * @copyright <%= pkg.author.name %> <%= grunt.template.today('yyyy') %>\n" +
              " * @license <%= pkg.licenses[0].type %> <<%= pkg.licenses[0].url %>>\n" +
              " * @link <%= pkg.homepage %>\n" +
              " * @module <%= pkg.name %>\n" +
              " * @version <%= pkg.version %>\n" +
              " */"
    },
    concat: {
      dist : {
        src : [
          "<banner>",
          "src/fragments/prefix._js",
          "src/preamble.js",

          "src/util/fn.js",

          "src/debugging/log.js",
          "src/debugging/debugging.js",
          "src/debugging/tree-viz.js",

          /* Misc */
          "src/util/q.js",
          "src/util/state-machine.js",
          "src/util/events.js",
          "src/util/utilities.js",

          /* Node Containers */
          "src/model/node/node.js",
          "src/model/node/node-state-machine.js",
          "src/model/node/node-abstract.js",
          "src/model/node/node-dom.js",
          "src/model/node/node-json.js",

          /* Relations */
          "src/model/relation/relation-spec.js",
          "src/model/relation/relation.js",
          "src/model/relation/is.js",
          "src/model/relation/are.js",
          "src/model/relation/ifexist.js",
          "src/model/relation/ifnexist.js",
          "src/model/relation/graft.js",
         
          /* Tree Model */
          "src/model/tree/tree.js",
          "src/model/tree/tree-spec.js",
          "src/model/tree/tree-dom.js",
          "src/model/tree/tree-json.js",
          "src/model/tree/tree-xpando.js",
          "src/model/forrest-spec.js",
          "src/model/forrest.js",
          "src/model/selection-spec.js",
          "src/model/selection.js",
          "src/model/dependency-spec.js",
         
          /* For creating async stuff */
          "src/model/factory.js",

          /* Parser */
          "src/parser/parser.js",
          "src/parser/parser-json.js",
          "src/parser/parser-cts.js",
          "src/parser/parser-cts-impl.js",
          "src/parser/html.js",
          //"autogen/cts2-parser.js",
          //"src/fragments/postparser._js",

          "src/engine.js",
          "src/autoloader.js",

          /* Xtras */
          "src/xtras/xtras.js",
          "src/xtras/color-tree.js",

          "src/fragments/postfix._js"
        ],
        dest : "release/cts.js"
      }
    },
    lint: {
      all: ['grunt.js', 'src/**/*.js']
    },
    min: {
      "release/cts.min.js": ["<banner>", "release/cts.js"]
    },
    qunit: {
      files: [
        "test/index.html"
      ]
    },
    watch: {
      scripts: {
        files: "<config:lint.files>",
        tasks: "default"
      }
    },
    jshint: {
      options: {
        browser: true
      }
    },
    jison: {
      js: {
        outputType: "js",
        inputType: 'jison',
        files: {
          'autogen/cts2-parser.js': 'src/parser/cts2.jison'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  require('./grunt-contrib-http-server')(grunt);

  grunt.registerTask('default', [
    'jshint',
    //'jison', -- too 
    'concat']);

  /*
   *
   */
  grunt.registerTask('serve', 'Serves the project.', function (env) {
    var http = require('http'),
        url  = require('url'),
        path = require('path'),
        fs   = require('fs');

    var mimeTypes = {
        "html": "text/html",
        "jpeg": "image/jpeg",
        "jpg" : "image/jpeg",
        "png" : "image/png",
        "js"  : "text/javascript",
        "css" : "text/css"};

    http.createServer(function(req, res) {
      var uri = url.parse(req.url).pathname;
      var filename = path.join(process.cwd(), unescape(uri));
      var stats;
    
      try {
        stats = fs.lstatSync(filename); // throws if path doesn't exist
      } catch (e) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.write('404 Not Found\n');
        res.end();
        return;
      }
    
      if (stats.isFile()) {
        // path exists, is a file
        var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
        res.writeHead(200, {'Content-Type': mimeType} );
    
        var fileStream = fs.createReadStream(filename);
        fileStream.pipe(res);
      } else if (stats.isDirectory()) {
        // path exists, is a directory
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write('Index of '+uri+'\n');
        res.write('TODO, show index?\n');
        res.end();
      } else {
        // Symbolic link, other?
        // TODO: follow symlinks?  security?
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.write('500 Internal server error\n');
        res.end();
        // This is a test
      }
    }).listen(1337);
  });

};
