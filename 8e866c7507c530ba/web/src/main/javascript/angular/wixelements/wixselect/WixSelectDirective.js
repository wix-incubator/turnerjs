W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    angular.module('wixElements').directive('wixSelect', function (editorResources) {
        return {
            restrict: 'E',
            templateUrl: editorResources.getAngularPartialPath('/wixelements/wixselect/WixSelectTemplate.html'),
            scope: {
                label: '@',
                tooltip: '@',
                wixData: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
                scope.translate = function (key) {
                    return editorResources.translate(key, null, key);
                };
            }
        };
    });
});