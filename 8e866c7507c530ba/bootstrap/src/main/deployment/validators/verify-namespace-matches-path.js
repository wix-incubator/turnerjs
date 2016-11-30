/**
 * Created by eitanr on 6/10/14.
 */
var path = require('path');

module.exports = function verifySkinNamespaceMatchesPath(data, anylint) {
    'use strict';
    var errors = [],
        filesPathPrefix = ['src', 'main', 'javascript'].join(path.sep) + path.sep,
        experimentsFolder = filesPathPrefix + 'experiments' + path.sep,
        capitalize = function (str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },
        isDeprecated = function (expr) {
            return expr.filePath.indexOf(path.sep + 'deprecated' + path.sep) !== -1;
        },
        matchNamespaceToPath = function (definitionType) {
            data.map(function getFilesPathsAndDefinitions(dataNode) {
                return {
                    filePath: dataNode.filePath,
                    expressions: anylint.datagrabbers.top_level_ast(
                        dataNode.ast,
                        anylint.filters.class_definition,
                        anylint.extractors.class_definition
                    )
                };
            })
                .filter(function onlySkinExpressions(expr) {
                    return expr.expressions.length > 0 && !isDeprecated(expr) && expr.expressions[0].name.toLowerCase() === definitionType;
                })
                .forEach(function (skinExpression) {
                    var filePath = skinExpression.filePath,
                        namespace = skinExpression.expressions[0].argument.split('.'),
                        i;

                    if (filePath.indexOf(experimentsFolder) === 0) {
                        //remove 'New' suffix if exists in the experiment name
                        if (namespace[namespace.length - 1].toLowerCase() === 'new') {
                            namespace = namespace.slice(0, namespace.length - 2);
                        }
                        //remove the experiment name suffix
                        namespace = namespace.slice(0, namespace.length - 2);

                        //remove the experiments folder prefix
                        filePath = filePath.replace(filesPathPrefix + 'experiments' + path.sep, '');
                    } else {
                        filePath = filePath.replace(['src', 'main', 'javascript'].join(path.sep) + path.sep, '');
                        filePath = filePath.replace(['src', 'main'].join(path.sep) + path.sep, '');
                    }

                    filePath = filePath.substr(0, filePath.length - 3).split(path.sep);

                    for (i = 0; i < namespace.length; i++) {
                        if (namespace[i] !== filePath[i]) {
                            errors.push(capitalize(definitionType) + ' definition namespace "' + namespace.join('.') + '" doesnt match path "' + filePath.join(path.sep) + '"');
                        }
                    }
                    if (definitionType === 'dataSchema') {
                        console.log(filePath.join('/') + ' ' + namespace.join('.'));
                    }
                });
        };

    [
//        'bootstrapClass',
//        'experiment',
//        'experimentPlugin',
//
//        'Class',
//        'newClass',
//
//        'Const',
//        'newConst',
//
//        'component',
//        'newComponent',
//
        'skin',
        'newSkin'
//
//        'dataItem',
//        'newDataItem',
//
//        'dataThemeItem',
//        'newDataThemeItem',
//
//        'dataPropertyItem',
//        'newDataPropertyItem',
//
//        'dataSchema',
//        'newDataSchema'
    ].forEach(matchNamespaceToPath);


    return errors;
};
