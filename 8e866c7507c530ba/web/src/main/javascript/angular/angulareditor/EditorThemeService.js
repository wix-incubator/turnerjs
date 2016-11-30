W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    angular.module('angularEditor').factory('editorTheme', function () {
        var previewTheme = W.Preview.getPreviewManagers().Theme;

        function getPreviewThemeProperty(propertyName) {
            if(previewTheme) {
                return previewTheme.getProperty(propertyName) ;
            }
            return null;
        }

        function getPropertiesAccordingToType(propertyType) {
            return previewTheme.getPropertiesAccordingToType(propertyType);
        }

        function getProperty(property) {
            return previewTheme.getProperty(property);
        }

        return {
            'getPreviewThemeProperty': getPreviewThemeProperty,
            'getPropertiesAccordingToType': getPropertiesAccordingToType,
            'getProperty': getProperty
        };
    });
});
