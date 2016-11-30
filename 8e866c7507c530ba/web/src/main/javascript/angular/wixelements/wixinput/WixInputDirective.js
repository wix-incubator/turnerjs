W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    var app = angular.module('wixElements');
    app.directive('wixInput', function (editorResources) {
        return {
            restrict: 'E',
            templateUrl: editorResources.getAngularPartialPath('/wixelements/wixInput/wixInputTemplate.html'),
            scope: {
                label: '@',
                placeholder: '@',
                tooltip: '@',
                validator: '@',
                wixData: '=',
                onClick: '&'
            },
            link: {
                pre: function(scope) {
                    scope.placeholder = scope.placeholder || '';
                },
                post: function (scope, element, attrs) {
                    if (attrs.readOnly) {
                        element.find('input').attr('readonly', 'readonly');
                    }
                }
            }
        };
    });
});