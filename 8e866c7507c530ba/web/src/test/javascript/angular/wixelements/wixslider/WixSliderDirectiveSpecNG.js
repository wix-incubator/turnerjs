describe('Unit: WixSliderDirective', function () {
    'use strict';
    var rootScope, scope, elm, mockDoc,
        configManager = TestsUtils.mocks.configManager();

    beforeEach(function () {
        module('wixElements');
        module('htmlTemplates');
    });

    beforeEach(module(function ($provide) {
        $provide.factory('editorResources', TestsUtils.mocks.editorResources);

        $provide.factory('mathUtils', TestsUtils.mocks.mathUtils);

        $provide.factory('configManager', TestsUtils.mocks.configManager);

        mockDoc = angular.element(document.createElement('div'));
        $provide.value('$document', mockDoc);
    }));

    beforeEach(inject(function ($rootScope) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
        $rootScope.topology = {webThemeDir: 'testThemeDir'};
    }));

    describe("slider initialization default values", function () {
        beforeEach(inject(function ($compile) {
            elm = $compile('<wix-slider wix-data="5" label="SLIDESHOW_GALLERY_INTERVAL" ></wix-slider>')(scope);
            scope.$digest();
        }));

        it('Should create themeDir on the directive scope', function () {
            var directiveScope = elm.isolateScope();

            expect(directiveScope.webThemeDir).toEqual('testThemeDir');
        });

        it('Should have default values for directive parameters', function () {
            var directiveScope = elm.isolateScope();

            expect(directiveScope.max).toEqual(100);
            expect(directiveScope.min).toEqual(0);
            expect(directiveScope.step).toEqual(1);
            expect(directiveScope.inputWidth).toEqual('5em');
            expect(directiveScope.knobPosition).toEqual('5%');
        });
    });

    describe('General default behavior', function () {
        var mockKnobElm = {
            setStyle: function () {
            }
        };
        var mockSliderContainer = {
            getPosition: function () {
                return {
                    x: 1
                };
            },
            getWidth: function () {
                return 10;
            },
            on: function (eventName, listener) {
                this[eventName] = listener;
            }
        };
        beforeEach(inject(function ($compile, mathUtils) {
            scope.sliderValue = 3;
            spyOn(mathUtils, 'percentFromValue').and.callThrough();
            var html = '<wix-slider label="SLIDER_LABEL" wix-data="sliderValue" step="0.05" min="1" max="10" label="SLIDESHOW_GALLERY_INTERVAL" ><div class="wix-slider-sliderKnob"></div></wix-slider>';
            var tempElm = angular.element(html);
            spyOn(tempElm[0], 'querySelector').and.callFake(function (className) {
                if (className === '.wix-slider-container') {
                    return mockSliderContainer;
                } else if (className === '.wix-slider-sliderKnob') {
                    return mockKnobElm;
                }
            });
            spyOn(mockKnobElm, 'setStyle');
            elm = $compile(tempElm)(scope);
            scope.$digest();
        }));

        describe('Slider initialization with values from html', function () {
            it('Should take the values from the html and update slider knob position', function () {
                var directiveScope = elm.isolateScope();

                expect(directiveScope.max).toEqual(10);
                expect(directiveScope.min).toEqual(1);
                expect(directiveScope.step).toEqual(0.05);
                expect(directiveScope.knobPosition).toEqual('3%');
                expect(mockKnobElm.setStyle).toHaveBeenCalledWith('left', '3%');
            });
        });

        describe('Response to mouse events', function () {
            it('Should calculate slider value on mouse down event and update scope', function () {
                var downEvent = jQuery.Event('mousedown');
                downEvent.pageX = 6;

                angular.element(mockSliderContainer).trigger(downEvent);

                expect(scope.sliderValue).toEqual(50);
            });

            it('Should calculate slider value on mouse down event and update scope', function () {
                var downEvent = jQuery.Event('mousedown');
                downEvent.pageX = 6;
                var moveEvent = jQuery.Event('mousemove');
                moveEvent.pageX = 8;
                var sliderContainer = angular.element(mockSliderContainer);
                sliderContainer.trigger(downEvent);

                mockDoc.trigger(moveEvent);

                expect(scope.sliderValue).toEqual(70);
            });

            it('Should turn off the listeners on mouse up event', function () {
                var downEvent = jQuery.Event('mousedown');
                downEvent.pageX = 6;
                var moveEvent = jQuery.Event('mousemove');
                moveEvent.pageX = 8;
                var upEvent = jQuery.Event('mouseup');
                var sliderContainer = angular.element(mockSliderContainer);
                sliderContainer.trigger(downEvent);

                mockDoc.trigger(upEvent);
                mockDoc.trigger(moveEvent);

                expect(scope.sliderValue).toEqual(50);
            });
        });
    });

});