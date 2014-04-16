var lint = require('jake-jshint');
var temp = require('temp').track();
var fs = require('fs');

desc('Default build action');
task('default', function() {
    jake.Task['lint'].invoke();
});

desc('Generate API Documentation');
task('docs', function() {
    // build config for jsdoc
    var jsdocconfig = {
        "source": {
	    "include": ["README.md","servicenow.js"]
        },
        "opts": {
	    "destination": "./api/",
	    "verbose": true
        },
        "plugins": ["plugins/markdown"],
        "markdown": {
	    "parser": "evilstreak"
        }
    };
    
    // write it out to a file because jsdoc doesn't support being called from JavaScript yet
    var f = temp.openSync();
    fs.writeSync(f.fd,JSON.stringify(jsdocconfig));
    fs.close(f.fd);

    // run jsdoc with our config file
    jake.exec([
	'node_modules/.bin/jsdoc -c ' + f.path
    ],function() {
	complete('docs generated');
    });
});

desc("Lint the code");
task("lint", [], function() {
    var files = new jake.FileList();
    
    files.include("*.js");
    files.exclude("node_modules");

    var options = {
        node: true
    };
    
    var globals = {
        describe: false
    };
    
    var pass = lint.validateFileList(files.toArray(), options, globals);
    if (!pass) fail("Lint failed");
});

