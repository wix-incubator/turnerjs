W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';
    /**
     * @ngdoc directive
     * @name wixElements.directive:wixSwitchButton
     * @restrict E
     * @element wix-switch-button
     * @param {boolean} wix-data - model for the switch button
     * @param {function=} on-toggle - callback to be called on change event

     * @description
     * creates a "ON / OFF" switch button
     *
     */
    angular.module("wixElements").directive("wixSwitchButton", function (editorResources) {
        return {
            restrict: 'E',
            templateUrl: editorResources.getAngularPartialPath('/wixelements/wixswitchbutton/WixSwitchButtonTemplate.html'),
            scope: {
                checked: '=wixData',
                onToggle: '&'
            },
            link: function (scope, elem, attrs) {
                scope.toggleState = function () {
                    scope.checked = !scope.checked;
                    scope.onToggle({"state": scope.checked});
                };
                scope.getClass = function () {
                    return (scope.checked) ? "enabled" : "disabled";
                };
            }
        };
    });
});