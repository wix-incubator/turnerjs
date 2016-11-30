W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    angular.module('wixElements').directive('wixAddAnimation', function (editorResources, editorComponent, editorCommands) {
        return {
            restrict: 'E',
            templateUrl: editorResources.getAngularPartialPath('/wixelements/wixaddanimation/WixAddAnimationTemplate.html'),
            scope: {},
            link: function (scope, element, attrs) {
                var LABELS = {
                    editAnimation: 'FPP_EDIT_ANIMATION_LABEL',
                    addAnimation: 'FPP_ADD_ANIMATION_LABEL'
                };

                function setAnimationButtonLabel() {
                    var hasBehaviors = !!editorComponent.getEditedComponent().getBehaviors();
                    scope.btnLabel = hasBehaviors ? LABELS.editAnimation : LABELS.addAnimation;
                }

                editorCommands.listenToCommand('WEditorCommands.AnimationUpdated', scope, setAnimationButtonLabel);

                scope.openAnimationDialog = function () {
                    editorCommands.executeCommand('WEditorCommands.ShowAnimationDialog');
                };

                setAnimationButtonLabel();
            }
        };
    });
});