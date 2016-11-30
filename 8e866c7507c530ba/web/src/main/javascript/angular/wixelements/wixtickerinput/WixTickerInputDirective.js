W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    var app = angular.module('wixElements');
    app.directive('wixTickerInput', function (editorResources, mathUtils) {
        return {
            restrict: 'E',
            templateUrl: editorResources.getAngularPartialPath('/wixelements/wixtickerinput/WixTickerInputTemplate.html'),
            scope: {
                label: '@',
                disabled: '@',
                units: '@',
                inputWidth: '@',
                wixData: '='
            },
            link: function postLink(scope, element, attrs) {
                var inputElm = element[0].querySelector('.wix-ticker-input-input');
                scope.max = (+attrs.max) || 100;
                scope.min = (+attrs.min) || 0;
                scope.step = (+attrs.step) || 1;
                inputElm.value = scope.wixData;

                startListenToChange();
                scope.$watch('wixData', function (newValue) {
                    inputElm.value = newValue;
                });

                function changeHandler() {
                    var normalizedValue = mathUtils.normalizeNumberToStepAndRange(inputElm.value, scope.step, scope.min, scope.max);
                    scope.wixData = normalizedValue;
                    inputElm.value = normalizedValue;
                    scope.$apply();
                }

                function keyUpHandler(e, data) {
                    var keyCode = e.keyCode || data.keyCode;  // for tests - event data is passed in second argument
                    switch (keyCode) {
                        case 40: // down arrow
                        case 38: // up arrow
                        case 13: //Enter
                            changeHandler(e);
                            break;
                    }
                }

                function startListenToChange() {
                    var jQinputElm = angular.element(inputElm);
                    jQinputElm.on(Constants.CoreEvents.KEY_UP, keyUpHandler);
                    jQinputElm.on(Constants.CoreEvents.MOUSE_UP, changeHandler);
                    jQinputElm.on(Constants.CoreEvents.BLUR, changeHandler);
                }
            }
        };
    });
});
