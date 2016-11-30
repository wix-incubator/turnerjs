W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    angular.module('wixElements')
        .directive('wixSlider', function ($rootScope, $document, editorResources, mathUtils) {
            return {
                restrict: 'E',
                templateUrl: editorResources.getAngularPartialPath('/wixelements/wixslider/WixSliderTemplate.html'),
                priority: 1,
                scope: {
                    label: '@',
                    hideInput: '@',
                    noFloats: '@',
                    leftIcon: '@',
                    rightIcon: '@',
                    units: '@',
                    disabled: '@',
                    inputLabel: '@',
                    wixData: '='
                },
                compile: function compile(tElement, tAttrs) {
                    return {
                        pre: function preLink(scope, element, attrs) {
                            scope.webThemeDir = $rootScope.topology.webThemeDir;
                            scope.max = (+attrs.max) || 100;
                            scope.min = (+attrs.min) || 0;
                            scope.step = (+attrs.step) || 1;
                            scope.inputWidth = (attrs.leftIcon && attrs.rightIcon) ? '4em' : '5em';

                            //Zeroize non number values
                            if (!isNaN(parseFloat(scope.wixData))) {
                                scope.wixData = parseFloat(scope.wixData);
                            } else if (scope.wixData !== '-' && scope.wixData !== '.') {
                                scope.wixData = 0;
                            }

                            scope.knobPosition = mathUtils.percentFromValue(scope.min, scope.max, scope.wixData) + '%';
                        },
                        post: function postLink(scope, element, attrs) {
                            var sliderContainer = element[0].querySelector('.wix-slider-container'),
                                knobElm = element[0].querySelector('.wix-slider-sliderKnob'),
                                sliderContainerWidth = sliderContainer.getWidth(),
                                sliderContainerXPosition = sliderContainer.getPosition().x;

                            knobElm.setStyle('background', 'url(' + scope.webThemeDir + 'button/slider_sprite.png) no-repeat 50% 0');
                            updateKnobPosition(mathUtils.percentFromValue(scope.min, scope.max, scope.wixData));
                            scope.$watch('wixData', function (newValue) {
                                updateKnobPosition(newValue);
                            });

                            angular.element(sliderContainer).on(Constants.CoreEvents.MOUSE_DOWN, sliderMouseDownHandler);

                            function calculateSliderValue(pageX) {
                                var percent = (pageX - sliderContainerXPosition) * 100 / sliderContainerWidth;
                                var value = mathUtils.valueFromPercent(scope.min, scope.max, percent);
                                return mathUtils.normalizeNumberToStepAndRange(value, scope.step, scope.min, scope.max, scope.noFloats);
                            }

                            function sliderMouseDownHandler(event, extraData) {
                                var pageX = event.pageX || extraData.pageX;
                                $document.on(Constants.CoreEvents.MOUSE_MOVE, sliderMouseMoveHandler);
                                $document.on(Constants.CoreEvents.MOUSE_UP, sliderMouseUpHandler);

                                scope.wixData = calculateSliderValue(pageX);
                                updateKnobPosition(scope.wixData);

                                scope.$apply();
                            }

                            function sliderMouseMoveHandler(event) {
                                sliderContainerWidth = sliderContainer.getWidth();
                                sliderContainerXPosition = sliderContainer.getPosition().x;

                                scope.wixData = calculateSliderValue(event.pageX);
                                updateKnobPosition(scope.wixData);

                                scope.$apply();
                            }

                            function sliderMouseUpHandler(event) {
                                $document.off(Constants.CoreEvents.MOUSE_MOVE, sliderMouseMoveHandler);
                                $document.off(Constants.CoreEvents.MOUSE_UP, sliderMouseUpHandler);
                            }

                            function updateKnobPosition(value) {
                                var leftVal = mathUtils.percentFromValue(scope.min, scope.max, value) + '%';
                                knobElm.setStyle('left', leftVal);
                            }
                        }
                    };

                }
            };

        });
});