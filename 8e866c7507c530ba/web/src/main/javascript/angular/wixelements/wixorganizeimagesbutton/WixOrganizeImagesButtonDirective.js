W.AngularManager.executeExperiment("NGCore", function() {
    'use strict' ;

    var app = angular.module("wixElements") ;
    app.directive("wixOrganizeImagesButton", function(editorResources, galleryService) {
        var templatePath = '/wixelements/wixorganizeimagesbutton/WixOrganizeImagesButtonTemplate.html';
        return {
            restrict: 'E',
            scope: {
                galleryConfigId: '@'
            },
            templateUrl: editorResources.getAngularPartialPath(templatePath),
            link: function(scope) {
                scope.organizeImages = function() {
                    galleryService.openOrganizeImages(scope.galleryConfigId) ;
                } ;
            }
        } ;
    }) ;
}) ;