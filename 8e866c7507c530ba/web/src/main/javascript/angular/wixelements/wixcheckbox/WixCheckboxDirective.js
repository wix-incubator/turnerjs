W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    var app = angular.module('wixElements');

    /**
     * @ngdoc directive
     * @name wixElements.directive:wixCheckbox
     * @restrict E
     * @element wix-checkbox
     * @param {string} label The label to show on the button. The label will be automatically translated.
     * @param {string=} tooltip The text to pass to the tooltip.  Will be automatically translated.
     * @param {boolean/string} wix-data The scope element to match with the checkbox.
     * @param {string} true-value The string to return / listen to when the checkbox should be checked
     * @param {string} false-value The string to return / listen to when the checkbox should be unchecked

     * @description
     * creates a checkbox with an associate label in the default wix style.
     *
     * @example
     <example>
     <file name="script.js">
     function startExample () {
        var exampleScripts = ['wixelements/wixcheckbox/WixCheckboxDirective.js','utilsdirectives/WixTooltipDirective.js'] ;
        loadModuleScripts(exampleScripts, start) ;
    }

     function start() {
             angular.module("wixElements").controller("myController", function ($scope) {
            $scope.truefalse = false;
            $scope.yesno = 'yes';
        });

     }
     </file>
     <file name="index.html">
     <div ng-controller="myController">
     <div  style="width:200px">
     <wix-checkbox label="'check me'" wix-data="truefalse" tooltip="'i am a helpful tooltip'"></wix-checkbox>
     <wix-checkbox label="'check me: yes/no'" wix-data="yesno" true-value="yes" false-value="no" tooltip="'i am a helpful tooltip'"></wix-checkbox>
     </div>
     <div>
     <span style="margin-right:10px">Checkbox 1 is checked:</span>
     <span>{{truefalse}}</span>
     </div>
     <div>
     <span style="margin-right:10px">Checkbox 2 is checked:</span>
     <span>{{yesno}}</span>
     </div>
     </div>
     </file>
     </example>
     *
     */
    app.directive('wixCheckbox', function (editorResources) {
        return {
            restrict: 'E',
            templateUrl: editorResources.getAngularPartialPath('/wixelements/wixcheckbox/WixCheckboxTemplate.html'),
            scope: {
                label: '@',
                tooltip: '@',
                validator: '@',
                wixData: '='
            },
            link: function (scope, elem, attrs) {
                scope.isChecked = false;
                scope.trueValue = attrs.trueValue || true;
                scope.falseValue = attrs.falseValue || false;
                scope._onLabelClick = function () {
                    scope.isChecked = !scope.isChecked;
                };

                scope.$watch('wixData', function (value) {
                    scope.isChecked = value === scope.trueValue;
                });

                scope.$watch('isChecked', function (value) {
                    if (value) {
                        scope.wixData = scope.trueValue ? scope.trueValue : value;
                    }
                    else {
                        scope.wixData = scope.falseValue ? scope.falseValue : value;
                    }

                });
            }
        };
    });
});