W.AngularManager.executeExperiment('NGPanels', function () {
    'use strict';

    angular.module('propertyPanel')
        .config(function (propertyPanelNavigationProvider) {
            propertyPanelNavigationProvider.registerPropertyPanel('wysiwyg.viewer.components.ClipArt', '/propertyPanel/panels/clipart/ClipartPanelView.html');
        })
        .controller('ClipartPanelController', function (editorComponent) {
            this._mediaGalleryCallback = function (rawData) {
                editorComponent.getEditedComponent()._mediaGalleryCallback(rawData);
            };
        });
});