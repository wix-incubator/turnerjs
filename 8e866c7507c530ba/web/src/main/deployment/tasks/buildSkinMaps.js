var fs = require('fs');
var runCommand = require('child_process').exec;
//var _ = require('lodash');

'use strict';
module.exports = function (grunt) {
    grunt.registerMultiTask('buildSkinMaps', function () {
            var data = this.data;

            data.listTemplate = grunt.config.getRaw(this.name + '.' + this.target + '.listTemplate');
            data.itemTemplate = grunt.config.getRaw(this.name + '.' + this.target + '.itemTemplate');
            data.itemSeparator = grunt.config.getRaw(this.name + '.' + this.target + '.itemSeparator');


            /******************Template data definition******************/

            var DEFAULT_LIST_TEMPLATE = '<%= items %>';
            var RENDER_ITEMS = '<% files.forEach(' + renderFile.toString() + ') %>';
            var DEFAULT_ITEM_TEMPLATE = '<%= File %>';
            var DEFAULT_ITEM_SEPARATOR = "\n";

            var expandOptions = {
                filter: 'isFile'
            };
            if (data.base) {
                expandOptions.cwd = data.base;
            }

            var originalFilePathArray = grunt.file.expand(expandOptions, data.includes),
                model = {
                files: originalFilePathArray.map(fixPath).map(addParams),
                listTemplate: data.listTemplate || DEFAULT_LIST_TEMPLATE,
                itemTemplate: data.itemTemplate || DEFAULT_ITEM_TEMPLATE,
                itemSeparator: data.itemSeparator || DEFAULT_ITEM_SEPARATOR,
                items: RENDER_ITEMS
            };

            var existingMaps = grunt.file.expand(expandOptions, data.existingMaps);

            var createdFiles = [],
                fileListBeforeFiltering,
                originalFilePath,
                folder,
                skinMap,
                destFilePath;

            /************************************************************/

            /*************************Task Logic*************************/

            //first , delete all existing skin maps
            existingMaps.forEach(function(skinMapPath) {
                grunt.file.delete(data.base + "/" + skinMapPath);
            });
            //now create new skin maps
            while (model.files.length > 0) {
                //TODO - create a copy of model and pass it as an argument to the methods below (so the original model won't be changed)
                fileListBeforeFiltering = model.files;
                originalFilePath = originalFilePathArray[0];
                folder = getFolder(originalFilePath);
                skinMap = prepareSkinMap(model, folder);
                destFilePath = calculateDestFilePath(originalFilePath) + "/" + model.FileName + ".js";

                grunt.file.write(destFilePath, skinMap);

                //remove skin files that were already scanned from both file lists
                model.files = fileListBeforeFiltering.filter(function(file) {
                    return !hasFolder(Object.keys(file)[0], folder);
                });
                originalFilePathArray = originalFilePathArray.filter(function(file) {
                    return !hasFolder(file, folder);
                });

                createdFiles.push(destFilePath);
            }

            /************************************************************/

            /************************Task methods************************/

                //gets a specific fileEntry and
            function renderFile(fileEntry, index, array) {
                /* global itemTemplate: true, itemSeparator: true */
                /* global print: true */
                var filePath = Object.keys(fileEntry)[0],
                    fileBreakDown = filePath.split('/'),
                    Class = fileBreakDown.pop().replace(/.js$/i, ''),
                    Package = fileBreakDown.join('.'),
                    endOfItem = index < array.length-1 ? "," : "",
                    Params = fileEntry[filePath];

                print(grunt.template.process(itemTemplate, {data: {Package: Package, Class: Class, Params: Params}}) + endOfItem);
                if (index !== array.length - 1) {
                    print(itemSeparator);
                }
            }

            function fixPath(path) {
                var fileObject = {};
                var fileData = fs.readFileSync(data.base + "/" + path).toString();
                var startIndex = fileData.indexOf("'")+1;
                var pathStart = fileData.substring(startIndex);
                fileObject[path] = pathStart.substring(0, pathStart.indexOf("'")).replace(/\./g, "/");
                return fileObject;
            }

            function addParams(fileObject) {
                var actualPath = Object.keys(fileObject)[0];
                var fullFileName = fileObject[actualPath];
                var entry = {};
                entry[fullFileName] = getSkinIconParams(actualPath);
                return entry
            }

            function getSkinIconParams(path) {
                var fileData = fs.readFileSync(data.base + "/" + path).toString();
                var iconParamsIndex = fileData.indexOf('iconParams');
                //TODO: handle the case that iconParams is commented out
                if (iconParamsIndex > -1) {
                    var params = fileData.substring(iconParamsIndex + 11);
                    return params.substring(0, params.indexOf(')'));
                }
                else {
                    return '{}';
                }
            }

            function getFolder(file) {
                var fileBreakDown = file.split("/");
                for (var i=1; i<fileBreakDown.length; i++) {
                    if (fileBreakDown[i-1] === 'components') {
                        return fileBreakDown[i];
                    }
                }
                return null;
            }

            function hasFolder(file, folder) {
                return file.indexOf('components/' + folder + "/") > -1;
            }

            function prepareSkinMap(templateData, folder) {
                var fileName = folder + "SkinMap";
                templateData.FileName = fileName;
                templateData.files = templateData.files.filter(function(file) {
                    return hasFolder(Object.keys(file)[0], folder);
                });
                return grunt.template.process('<%= listTemplate %>', {data: templateData});
            }

            function calculateDestFilePath(path) {
                var pathHead = /*'target/web/' + */data.base,
                    folder = 'viewer',
                    pathTail = path.substring(0, path.indexOf(folder) + folder.length);
                return pathHead + "/" + pathTail;
            }

            /************************************************************/

        }
    );
};