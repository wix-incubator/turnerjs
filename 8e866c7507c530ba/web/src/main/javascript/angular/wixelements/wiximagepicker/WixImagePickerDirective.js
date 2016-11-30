W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    var app = angular.module('wixElements');
    app.directive('wixImagePicker', function (editorResources, editorCommands) {
        var templateUrl = editorResources.getAngularPartialPath('/wixelements/wiximagepicker/WixImagePickerTemplate.html');

        return {
            restrict: 'E',
            templateUrl: templateUrl,
            scope: {
                label: '@',
                removeEnabled: '@',
                galleryType: '@',
                height: '@',
                width: '@',
                initialTab: '@',
                onImagePick: '&',
                wixData: '='
            },
            link: function (scope) {
                scope.handleClick = function () {
                    if (scope.onImagePick && typeof(scope.onImagePick) === 'function') {
                        var galleryId = scope.galleryType || 'photos';

                        var params = {
                            openCommand: 'panel',
                            componentName: 'WPhoto',
                            galleryConfigID: galleryId,
                            selectionType: 'single',
                            publicMediaFile: galleryId,
                            i18nPrefix: 'single_image',
                            mediaType: "picture",
                            hasPrivateMedia: null,
                            callback: scope._callback,
                            startingTab: scope.initialTab || 'my'
                        };

                        editorCommands.executeCommand('WEditorCommands.OpenMediaFrame', params);
                    }
                };

                scope._callback = function(rawData) {
                    //directly assigning the object will kill the getters and setters and will break the dataItem events.
                    _.forOwn(rawData, function (val, key) {
                        scope.wixData[key] = val;
                    });
                    scope.$apply();
                    scope.onImagePick({rawData: rawData});

                };
            }
        };
    });
});