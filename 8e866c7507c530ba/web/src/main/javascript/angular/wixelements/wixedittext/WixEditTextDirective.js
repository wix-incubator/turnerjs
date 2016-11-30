W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    angular.module('wixElements').directive('wixEditText', function (editorResources, editorCommands) {
        return {
            restrict: 'E',
            templateUrl: editorResources.getAngularPartialPath('/wixelements/wixedittext/WixEditTextTemplate.html'),
            scope: {},
            link: function (scope) {
                scope.startEditRichText = function () {
                    editorCommands.executeCommand('EditorUI.StartEditRichText');
                };
            }
        };
    });
});