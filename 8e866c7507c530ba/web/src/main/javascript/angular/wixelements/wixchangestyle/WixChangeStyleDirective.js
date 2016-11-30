W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    angular.module('wixElements').directive('wixChangeStyle', function (editorResources, editorComponent, editorUtils, editorCommands) {
        return {
            restrict: 'E',
            templateUrl: editorResources.getAngularPartialPath('/wixelements/wixchangestyle/WixChangeStyleTemplate.html'),
            scope: {},
            link: function (scope, element, attrs) {
                scope.openChangeStyleDialog = function () {
                    var editedComponent = editorComponent.getEditedComponent();
                    var pos = editorUtils.getPositionRelativeToWindow(element[0]);

                    editorCommands.executeCommand('WEditorCommands.ChooseComponentStyle', {
                        editedComponent: editedComponent,
                        left: pos.x,
                        editedComponentId: editedComponent.getID()
                    });
                };
            }
        };
    });
});