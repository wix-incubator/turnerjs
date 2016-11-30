W.AngularManager.executeExperiment("NGCore", function() {
    'use strict' ;

    /* istanbul ignore next */
    angular.module("wixElements").directive("wixColorSelectorField", function (editorResources) {
        var templatePath = '/wixelements/Wixcolorselectorfield/WixColorSelectorFieldTemplate.html';
        return {
            restrict: 'E',
            scope: {
                label: '@',
                wixData: '='
            },
            templateUrl: editorResources.getAngularPartialPath(templatePath)
        } ;
    }) ;
}) ;