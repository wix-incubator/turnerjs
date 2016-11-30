describe('Unit: WixFitContentToWindow', function () {
    'use strict';

    var rootScope, scope, elm,
        contentElement, containerHeightWithoutContent,
        windowHeight, bottomMargin, topMargin, originalContentHeight,
        contentScrollHeight, maxHeight,
        mockContentElement;

    beforeEach(module('utilsDirectives'));

    beforeEach(module(function ($provide) {
        $provide.factory('$document', function () {
            return [
                {
                    documentElement: {
                        clientHeight: ''
                    }
                }
            ];
        });

        $provide.factory('ngIncludeUtils', TestsUtils.mocks.ngIncludeUtils);
    }));

    beforeEach(inject(function ($rootScope, $window, $document) {
        rootScope = $rootScope;
        scope = $rootScope.$new();

        mockContentElement = {
            scrollHeight: 0,
            setStyle: function () {
            }
        };

        topMargin = 50;
        bottomMargin = 100;
        windowHeight = 1000;
        originalContentHeight = 200;
        containerHeightWithoutContent = 300;

        spyOn($window, 'getComputedStyle').and.returnValue({
            getPropertyValue: function () {
                return originalContentHeight;
            }
        });

        $document[0].documentElement.clientHeight = windowHeight;

    }));

    describe('directive initialization', function() {
        describe('- when waitForNgIncludes=true', function() {
            var ngIncludesCallback;

            beforeEach(inject(function($compile, ngIncludeUtils) {
                spyOn(ngIncludeUtils, 'listenForAllIncludeLoaded').and.callFake(function(element, scope, callback) {
                    ngIncludesCallback = callback;
                });

                spyOn(scope, '$emit');

                var html = '<div wix-fit-content-to-window wait-for-ng-includes="true" bottom-margin="' + bottomMargin + '" top-margin="' + topMargin + '"><div class="wix-content-wrapper"></div></div>';
                elm = $compile(html)(scope);
                scope.$digest();
            }));

            it('should wait for all ngIncludes to finish loading before executing its logic', inject(function(ngIncludeUtils) {
                expect(ngIncludeUtils.listenForAllIncludeLoaded.calls.argsFor(0)[0][0]).toEqual(elm[0]); // comparing the actual DOM node (not the angular.element)
                expect(ngIncludeUtils.listenForAllIncludeLoaded.calls.argsFor(0)[1]).toEqual(scope);
                expect(typeof(ngIncludesCallback)).toEqual('function');
                expect(scope.$emit).not.toHaveBeenCalled();
            }));

            it('should init its logic when all ngIncludes are loaded', function() {
                ngIncludesCallback();

                expect(scope.$emit).toHaveBeenCalled();
            });
        });


        xit('should init if waitForNgIncludes!=true', inject(function($compile) {
            var html = '<div wix-fit-content-to-window  bottom-margin="' + bottomMargin + '" top-margin="' + topMargin + '"><div class="wix-content-wrapper"></div></div>';
            var tempElm = angular.element(html);
            spyOn(tempElm[0], 'getElementsByClassName').and.returnValue([mockContentElement]);  //need to mock the content element because of scrollHeight
            spyOn(scope, '$emit');

            elm = $compile(tempElm)(scope);
            scope.$digest();

            expect(scope.$emit).toHaveBeenCalled();
        }));
    });

    describe('fit to content behavior', function () {
        beforeEach(inject(function ($compile) {
            var html = '<div wix-fit-content-to-window bottom-margin="' + bottomMargin + '" top-margin="' + topMargin + '"><div class="wix-content-wrapper"></div></div>';
            var tempElm = angular.element(html);
            spyOn(tempElm[0], 'getElementsByClassName').and.returnValue([mockContentElement]);  //need to mock the content element because of scrollHeight

            elm = $compile(tempElm)(scope);
            scope.$digest();
            contentElement = elm[0].querySelector('.wix-content-wrapper');

            spyOn(elm[0], 'getSize').and.returnValue({
                y: originalContentHeight + containerHeightWithoutContent
            });
            spyOn(mockContentElement, 'setStyle');
        }));

        xit('Should set height to auto when content scroll height can fit in the window', function () {
            mockContentElement.scrollHeight = 500;

            elm.isolateScope().$broadcast('windowResize');

            expect(mockContentElement.setStyle).toHaveBeenCalledWith('height', 'auto');
        });

        xit('Should set the maximum possible height on the content if window doesn\'t allow full content display', inject(function ($compile) {
            mockContentElement.scrollHeight = 600;

            elm.isolateScope().$broadcast('windowResize');

            expect(mockContentElement.setStyle).toHaveBeenCalledWith('height', 550);
        }));
    });

    describe('constant height behavior', function () {
        beforeEach(inject(function ($compile) {
            var html = '<div wix-fit-content-to-window enforce-max-content-height="true" bottom-margin="' + bottomMargin + '" top-margin="' + topMargin + '"><div class="wix-content-wrapper"></div></div>';
            elm = $compile(html)(scope);
            scope.$digest();
            contentElement = elm[0].querySelector('.wix-content-wrapper');
        }));

        xit('Should set the maximum possible height that the window allows, on the content element', inject(function ($window, $document) {
            var result = windowHeight - bottomMargin - topMargin - containerHeightWithoutContent;
            spyOn(elm[0], 'getSize').and.returnValue({
                y: originalContentHeight + containerHeightWithoutContent
            });
            spyOn(contentElement, 'setStyle');
            $document[0].documentElement.clientHeight = windowHeight;

            elm.isolateScope().$broadcast('windowResize');

            expect(contentElement.setStyle).toHaveBeenCalledWith('height', result);
        }));
    });

});