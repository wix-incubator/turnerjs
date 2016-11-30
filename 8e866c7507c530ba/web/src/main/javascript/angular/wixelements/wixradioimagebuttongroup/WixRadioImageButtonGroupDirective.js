W.AngularManager.executeExperiment("NGCore", function() {
    'use strict' ;

    var app = angular.module('wixElements') ;
    app.directive('wixRadioImageButtonGroup', function(editorResources) {
        var templateUrl     = editorResources.getAngularPartialPath('/wixelements/wixradioimagebuttongroup/WixRadioImageButtonGroupTemplate.html') ;
        return {
            restrict: 'E',
            scope: {
                label: "@",
                wixData: "=",
                buttonsData: "=",
                buttonWidth: "@",
                buttonHeight: "@"
            },
            templateUrl: templateUrl,
            link: function(scope) {
                scope.modelWrapper = {data: scope.wixData} ;
                scope.$watch('modelWrapper.data',
                function(newValue) {
                    scope.wixData = newValue ;
                }) ;
            }
        } ;
    }) ;
}) ;
