W.AngularManager.executeExperiment('NGDialogManagement', function () {
    'use strict';

    angular.module('utilsDirectives').directive('wixTooltip', function (editorCommands) {
        return {
            restrict: 'A', // default, but helps to be explicit...
            scope: {
                ttid: '=wixTooltip'
            },
            link: function (scope, iElement, iAttr) {
                scope.showTooltip = function (tooltipId, elm) {
                    editorCommands.executeCommand('Tooltip.ShowTip', { id: tooltipId }, elm);
                };

                scope.hideTooltip = function () {
                    editorCommands.executeCommand('Tooltip.CloseTip');
                };

                iElement.on('mouseenter', function (e) {
                    scope.showTooltip(scope.ttid, e.target);
                });
                iElement.on('mouseleave', scope.hideTooltip);
            }
        };
    });
});