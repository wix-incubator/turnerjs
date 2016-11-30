"use strict";

var path = require('path');

module.exports = function(grunt){
    var config = grunt.config.get(['debug-map']);

    grunt.registerTask('debug-map', 'Creating a debug map', function () {
        var done = this.async();

        var mainjson = require("../" + config.json);
        var template = grunt.file.read(__dirname+'/debug-map.template');


        var packageFound = false;
        var scripts = [];
        mainjson.forEach(function(item){
            if (item.id.toLowerCase() === config['package-id']){
                packageFound = true;
                item.include.forEach(function(entry){
                    scripts.push('bootstrapBaseUrl + "'+config.scriptLocationPrefix+'/'+entry+'"');
                });
            }
        }.bind(this));

        if(!packageFound){
            grunt.error.writeln('Could not find package-id named ['+ config['package-id'] +']');
            done(false);
        }

        function writeOutput(target){
            grunt.file.write(target, grunt.template.process(template , {data: {scripts:scripts.join(',\n')}}));
        }

        if(config.target instanceof Array){
            config.target.forEach(writeOutput);
        }else{
            writeOutput(config.target);
        }

        done();
    });
};