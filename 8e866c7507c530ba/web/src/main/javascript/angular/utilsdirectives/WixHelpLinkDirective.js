W.AngularManager.executeExperiment('NGDialogManagement', function () {
    'use strict';

    angular.module('utilsDirectives').directive('wixHelpLink', function (editorCommands) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.on('click', openHelpDialog);

                function openHelpDialog(e) {
                    e.preventDefault();

                    var helpId = scope.$eval(attrs.wixHelpLink);
                    if (helpId) {
                        editorCommands.executeCommand("WEditorCommands.ShowHelpDialog", helpId);
                    }

                    return false;
                }
            }
        };
    });
});