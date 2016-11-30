define(['lodash'], function (_) {
    "use strict";

    var pathesToIgnore = [
        'documentServices.history.privateServices',
        'documentServices.components.COMPONENT_DEFINITION_MAP',
        'documentServices.siteSegments.arrangement',
        'documentServices.components.layout.RESIZE_SIDES',
        'documentServices.components.code.VALIDATIONS',
        'documentServices.seo.ERRORS',
        'documentServices.social.facebook.ERRORS',
        'documentServices.favicon.ERRORS',
        'documentServices.siteName.ERRORS',
        'documentServices.viewMode.VIEW_MODES',
        'documentServices.mainMenu.ITEM_TYPES',
        'documentServices.tpa.constants',
        'documentServices.tpa.bi',
        'documentServices.errors',
        'documentServices.wixCode.log.levels'
    ];

    var QUERY = {
        TESTED: 'tested',
        UNTESTED: 'untested',
        TOTAL: 'total'
    };

    var testedAPIFunctions = {};

    function checkFunctionAsTested(path) {
        _.set(testedAPIFunctions, path, true);
    }

    function wasFunctionTested(path) {
        return _.has(testedAPIFunctions, path);
    }

    function getNumberOfTestedFunctions(object, startPath) {
        return getNumberOfFunctions(QUERY.TESTED, object, startPath);
    }

    function getNumberOfUnTestedFunctions(object, startPath) {
        return getNumberOfFunctions(QUERY.UNTESTED, object, startPath);
    }

    function getTotalNumberOfFunctions(object, startPath) {
        return getNumberOfFunctions(QUERY.TOTAL, object, startPath);
    }

    function getCoveragePercent(object, startPath) {
        var numOfTestedFunctions = getNumberOfTestedFunctions(object, startPath);
        var totalNumOfFunction = getTotalNumberOfFunctions(object, startPath);
        return (numOfTestedFunctions / totalNumOfFunction * 100).toFixed(1);
    }

    function getNumberOfFunctions(query, object, path) {
        var sum = 0;
        _.forOwn(object, function (value, key) {
            var newPath = path + '.' + key.toString();
            if (_.isFunction(value)) {
                switch (query) {
                    case QUERY.TESTED:
                    {
                        if (wasFunctionTested(newPath)) {
                            sum++;
                        }
                        break;
                    }
                    case QUERY.UNTESTED:
                    {
                        if (!wasFunctionTested(newPath)) {
                            sum++;
                        }
                        break;
                    }
                    case QUERY.TOTAL:
                    {
                        sum++;
                        break;
                    }
                }
            } else if (!_.isString(value) && !_.isArray(value) && !_.includes(pathesToIgnore, newPath)) {
                sum += getNumberOfFunctions(query, value, newPath);
            }
        });
        return sum;
    }

    function printUntestedFunctions(object, path) {
        var shouldPrintNamespace = true;

        //print functions first
        _.forOwn(object, function (value, key) {
            if (_.isFunction(value)) {
                var newPath = path + '.' + key;
                if (!wasFunctionTested(newPath)) {
                    if (shouldPrintNamespace) {
                        console.log();
                        console.log(path);
                        console.log('=========================================================================');
                    }

                    console.log(path.replace(/./g, ' ') + key);
                    shouldPrintNamespace = false;
                }
            }
        });

        //print other trees with functions
        _.forOwn(object, function (value, key) {
            var newPath = path + '.' + key;
            if (!_.isFunction(value) && !_.isString(value) && !_.isArray(value) && !_.includes(pathesToIgnore, newPath)) {
                var numOfUntestedFunction = getNumberOfUnTestedFunctions(value, newPath);
                if (numOfUntestedFunction > 0) {
                    printUntestedFunctions(value, newPath);
                    shouldPrintNamespace = true;
                }
            }
        });
    }

    return {
        checkFunctionAsTested: checkFunctionAsTested,
        wasFunctionTested: wasFunctionTested,
        getNumberOfTestedFunctions: getNumberOfTestedFunctions,
        getNumberOfUnTestedFunctions: getNumberOfUnTestedFunctions,
        getTotalNumberOfFunctions: getTotalNumberOfFunctions,
        getCoveragePercent: getCoveragePercent,
        printUntestedFunctions: printUntestedFunctions
    };
});
