W.AngularManager.executeExperiment("NGCore", function() {
    'use strict' ;

    angular.module('wixElements').directive('wixChangeGalleryButton', function (editorResources, galleryService) {
        var tpaTopology = editorResources.topology.tpa ;
        return {
            restrict: 'E',
            templateUrl: editorResources.getAngularPartialPath('/wixelements/wixchangegallerybutton/WixChangeGalleryButtonTemplate.html'),
            scope: {},
            link: function(scope, element, attributes) {
                scope.tpaResources = tpaTopology ;
                scope.openChangeGalleryDialog = function() {
                    galleryService.openChangeGalleryDialog() ;
                } ;
            }
        } ;
    }) ;
}) ;
