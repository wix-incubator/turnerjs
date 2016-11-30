describe('Unit: WixTickerInputDirective', function () {
    'use strict';

    var rootScope, scope, elm;

    beforeEach(function () {
        module('wixElements');
        module('htmlTemplates');
    });

    beforeEach(module(function ($provide) {
        $provide.factory('editorResources', TestsUtils.mocks.editorResources);

        $provide.factory('mathUtils', TestsUtils.mocks.mathUtils);
    }));

    beforeEach(inject(function ($rootScope) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
    }));

    describe('html with values', function () {
        var inputElm;

        beforeEach(inject(function ($compile, mathUtils) {
            scope.sliderValue = 5;
            spyOn(mathUtils, 'normalizeNumberToStepAndRange').and.callThrough();
            elm = $compile('<wix-ticker-input wix-data="sliderValue" label="{{inputLabel}}" min="2" max="8" step="0.5" disabled="true" input-width="5em"></wix-ticker-input>')(scope);
            scope.$digest();
            inputElm = elm[0].querySelector('.wix-ticker-input-input');
        }));


        describe('Directive initialization', function () {
            it('Should use the html values on the scope', function () {
                var directiveScope = elm.isolateScope();

                expect(directiveScope.min).toEqual(2);
                expect(directiveScope.max).toEqual(8);
                expect(directiveScope.step).toEqual(0.5);
                expect(directiveScope.disabled).toBeTruthy();
            });

            it('Should insert wix-data value to input field', function () {
                expect(inputElm.value).toEqual('5');
            });
        });

        describe('Directive events behavior', function () {
            it('Should listen to mouse up on input field and update scope', function () {
                var jQinputElm = angular.element(inputElm),
                    directiveScope = elm.isolateScope(),
                    newValue = '4';

                inputElm.value = newValue;
                jQinputElm.triggerHandler(Constants.CoreEvents.MOUSE_UP);

                expect(directiveScope.wixData).toEqual(+newValue);
            });

            it('Should call normalizeNumberToStepAndRange from mathUtils service when reading new value from dom', inject(function (mathUtils) {
                var jQinputElm = angular.element(inputElm),
                    directiveScope = elm.isolateScope(),
                    newValue = '4';

                inputElm.value = newValue;
                jQinputElm.triggerHandler(Constants.CoreEvents.MOUSE_UP);

                expect(mathUtils.normalizeNumberToStepAndRange)
                    .toHaveBeenCalledWith(newValue, directiveScope.step, directiveScope.min, directiveScope.max);
            }));

            it('Should listen to blur event on input field and update scope', function () {
                var jQinputElm = angular.element(inputElm),
                    directiveScope = elm.isolateScope(),
                    newValue = '4';

                inputElm.value = newValue;
                jQinputElm.triggerHandler(Constants.CoreEvents.BLUR);

                expect(directiveScope.wixData).toEqual(+newValue);
            });

            it('Should listen to key-up event on input field and update scope "down arrow"', function () {
                var jQinputElm = angular.element(inputElm),
                    directiveScope = elm.isolateScope(),
                    newValue = '4';

                inputElm.value = newValue;
                jQinputElm.triggerHandler(Constants.CoreEvents.KEY_UP, [
                    {keyCode: 40}
                ]);

                expect(directiveScope.wixData).toEqual(+newValue);
            });

            it('Should listen to key-up event on input field and update scope "up arrow"', function () {
                var jQinputElm = angular.element(inputElm),
                    directiveScope = elm.isolateScope(),
                    newValue = '4';

                inputElm.value = newValue;
                jQinputElm.triggerHandler(Constants.CoreEvents.KEY_UP, [
                    {keyCode: 38}
                ]);

                expect(directiveScope.wixData).toEqual(+newValue);
            });

            it('Should listen to key-up event on input field and update scope if key is "enter"', function () {
                var jQinputElm = angular.element(inputElm),
                    directiveScope = elm.isolateScope(),
                    newValue = '4';

                inputElm.value = newValue;
                jQinputElm.triggerHandler(Constants.CoreEvents.KEY_UP, [
                    {keyCode: 13}
                ]);

                expect(directiveScope.wixData).toEqual(+newValue);
            });

            it('Should listen to key-up event on input field and ignore if it is not enter, up arrow or down arrow ', function () {
                var jQinputElm = angular.element(inputElm),
                    directiveScope = elm.isolateScope(),
                    newValue = '4';

                inputElm.value = newValue;
                jQinputElm.triggerHandler(Constants.CoreEvents.KEY_UP, [
                    {keyCode: 39}
                ]);

                expect(directiveScope.wixData).not.toEqual(+newValue);
            });


            it('Should respond to change of wixData value in containing scope, and update the input field', function () {
                var newValue = 4;

                scope.sliderValue = newValue;
                scope.$digest();

                expect(inputElm.value).toEqual('' + newValue);
            });
        });
    });

    describe('html without values', function () {
        beforeEach(inject(function ($compile, mathUtils) {
            scope.sliderValue = 5;
            spyOn(mathUtils, 'normalizeNumberToStepAndRange').and.callThrough();
            elm = $compile('<wix-ticker-input wix-data="sliderValue" disabled="true" input-width="5em"></wix-ticker-input>')(scope);
            scope.$digest();
        }));

        it('Should use default values', function () {
            var directiveScope = elm.isolateScope();

            expect(directiveScope.min).toEqual(0);
            expect(directiveScope.max).toEqual(100);
            expect(directiveScope.step).toEqual(1);
        });
    });
});
