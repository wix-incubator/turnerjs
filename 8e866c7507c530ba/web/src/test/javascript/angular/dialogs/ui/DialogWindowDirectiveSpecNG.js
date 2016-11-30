describe('Unit: DialogWindow Directive', function () {
    'use strict';
    var rootScope, compile, scope, elm;
    var $ = jQuery;

    beforeEach(module('dialogs'));
    beforeEach(module('htmlTemplates'));

    beforeEach(module(function ($provide) {
        $provide.factory('dialogWindows', TestsUtils.mocks.dialogWindows);
        $provide.factory('ngIncludeUtils', TestsUtils.mocks.ngIncludeUtils);
    }));

    beforeEach(inject(function ($rootScope, $compile) {
        rootScope = $rootScope;
        compile = $compile;
        scope = $rootScope.$new();
    }));

    describe('Dialog position', function () {
        it('Should add wix-dialog-center class it attr positionType=center', inject(function () {
            elm = compile('<dialog-window position-type="center"></dialog-window>')(scope);
            scope.$digest();

            expect(elm.hasClass('wix-dialog-center')).toBeTruthy();
        }));

        it('Should add wix-dialog-top class it attr positionType=top', inject(function () {
            elm = compile('<dialog-window position-type="top"></dialog-window>')(scope);
            scope.$digest();

            expect(elm.hasClass('wix-dialog-top')).toBeTruthy();
        }));

        describe('position type = SIDE', function () {
            it('Should set the position relative to the left of the screen and level 0 by default', inject(function (dialogConsts, $document) {
                var level = 0;
                var sourceLeft = 0;
                var dialogWidth = 300;
                var mockClientWidth = 1000;
                var expectedPosition = dialogConsts.POSITION.ORIGIN.x + (level * dialogConsts.POSITION.OFFSET.x);

                $document[0] = {
                    body: {
                        clientWidth: mockClientWidth
                    }
                };

                elm = compile('<dialog-window position-type="side" dialog-width="' + dialogWidth + '"></dialog-window>')(scope);
                scope.$digest();

                expect(elm.css('left')).toEqual(expectedPosition + 'px');
                expect(elm.css('top')).toEqual(dialogConsts.POSITION.ORIGIN.y + 'px');
            }));

            it('Should set the position relative to the left of the screen sourceLeft is on the left side of the screen', inject(function (dialogConsts, $document) {
                var level = 1;
                var sourceLeft = 100;
                var dialogWidth = 300;
                var mockClientWidth = 1000;
                var expectedPosition = dialogConsts.POSITION.ORIGIN.x + (level * dialogConsts.POSITION.OFFSET.x);

                $document[0] = {
                    body: {
                        clientWidth: mockClientWidth
                    }
                };

                elm = compile('<dialog-window position-type="side" dialog-width="' + dialogWidth + '" position-left="' + sourceLeft + '" level="' + level + '"></dialog-window>')(scope);
                scope.$digest();

                expect(elm.css('left')).toEqual(expectedPosition + 'px');
                expect(elm.css('top')).toEqual(dialogConsts.POSITION.ORIGIN.y + 'px');
            }));

            it('Should set the position relative to the right of the screen sourceLeft is on the right side of the screen', inject(function (dialogConsts, $document) {
                var level = 2;
                var sourceLeft = 900;
                var dialogWidth = 300;
                var mockClientWidth = 1000;
                var expectedPosition = mockClientWidth - (dialogConsts.POSITION.ORIGIN.x + (level * dialogConsts.POSITION.OFFSET.x) + dialogWidth);
                $document[0] = {
                    body: {
                        clientWidth: mockClientWidth
                    }
                };
                spyOn($.fn, 'width').and.returnValue(dialogWidth);

                elm = compile('<dialog-window position-type="side" dialog-width="' + dialogWidth + '" position-left="' + sourceLeft + '" level="' + level + '"></dialog-window>')(scope);
                scope.$digest();

                expect(elm.css('left')).toEqual(expectedPosition + 'px');
                expect(elm.css('top')).toEqual(dialogConsts.POSITION.ORIGIN.y + 'px');
            }));
        });

        describe('position type = ABSOLUTE', function () {
            it('Should set top & left style if attr positionType=absolute according to positionLeft & positionTop', inject(function () {
                elm = compile('<dialog-window position-type="absolute" position-left="100" position-top="200"></dialog-window>')(scope);
                scope.$digest();

                expect(elm.css('left')).toEqual('100px');
                expect(elm.css('top')).toEqual('200px');
            }));

            describe('Wait for content to be ready', function () {
                describe('when content has fitContentToWindow directive', function () {
                    beforeEach(function () {
                        var html = '<dialog-window position-type="absolute" position-left="100" position-top="200" mock-att="wix-fit-content-to-window"></dialog-window>';
                        elm = compile(html)(scope);
                        scope.$digest();
                    });

                    it('Should hide dialog until fit to content is done ', inject(function () {
                        expect(scope.hideDialog).toEqual(true);
                    }));

                    it('Should show dialog after fitContentDone event', inject(function () {
                        scope.$emit('fitContentToWindowDone');

                        expect(scope.hideDialog).toEqual(false);
                    }));

                });

                describe('when content does not have fitContentToWindow directive', function () {
                    var ngIncludesCallback;
                    var tempElm;

                    beforeEach(inject(function (ngIncludeUtils, $templateCache) {
                        spyOn(ngIncludeUtils, 'listenForAllIncludeLoaded').and.callFake(function (element, scope, callback) {
                            ngIncludesCallback = callback;
                        });
                        $templateCache.put('angular/someurl.html', "someTemplateContent");
                        var html = '<dialog-window dialog-template-url="someurl.html" position-type="absolute" position-left="100" position-top="200"></dialog-window>';
                        tempElm = angular.element(html);
                        elm = compile(tempElm)(scope);
                        scope.$digest();
                    }));

                    it('Should hide dialog until all ngIncludes are loaded ', function () {
                        expect(scope.hideDialog).toEqual(true);
                    });

                    it('Should wait for all ngIncludes to load', inject(function (ngIncludeUtils) {
                        expect(ngIncludeUtils.listenForAllIncludeLoaded.calls.argsFor(0)[0][0]).toEqual(tempElm[0]); // comparing the actual DOM node (not the angular.element)
                        expect(ngIncludeUtils.listenForAllIncludeLoaded.calls.argsFor(0)[1]).toEqual(scope);
                        expect(typeof(ngIncludesCallback)).toEqual('function');
                    }));

                    it('Should show dialog and update position after all ngIncludes are loaded', inject(function () {
                        ngIncludesCallback();

                        expect(scope.hideDialog).toEqual(false);
                    }));

                });
            });

            it('Should fix dialog position to be in window after content is loaded', inject(function ($document) {
                elm = compile('<dialog-window position-type="absolute" position-left="420" position-top="400"></dialog-window>')(scope);
                scope.$digest();
                spyOn(elm[0], 'getBoundingClientRect').and.returnValue({
                    top: 400,
                    bottom: 600,
                    left: 420,
                    right: 520,
                    width: 100,
                    height: 200
                });
                $document[0] = {
                    documentElement: {
                        clientWidth: 500,
                        clientHeight: 500
                    }
                };

                scope.$emit('fitContentToWindowDone');

                expect(elm.css('top')).toEqual('300px');
                expect(elm.css('left')).toEqual('400px');
            }));
        });
    });

    describe('Dialog Dragging', function () {
        var elm, scope;
        var defaultDragHandleClass = 'wix-dialog-titlebar';

        beforeEach(function() {
            scope = rootScope.$new();
            elm = compile('<dialog-window draggable="true" drag-handle-class="' + defaultDragHandleClass + '"></dialog-window>')(scope);
            scope.$digest();
        });

        it('Should set dialog to draggable if attr draggable=true with default dragHandleClass if attrs.dragHandleClass is undefined', inject(function () {
            expect(elm.find('.' + defaultDragHandleClass).hasClass('wix-draggable')).toBeTruthy();
        }));

        it("should calculate the drag limits to be bound to the window size with a margin", inject(function($window) {
            var MARGIN_TO_TEST = 25;
            var handle = {height: function() {
                return 70;
            }};
            var calculateDragLimits = scope.calculateDragLimits(handle, MARGIN_TO_TEST);

            expect(calculateDragLimits).toBeDefined();
            expect(calculateDragLimits.top).toBe(MARGIN_TO_TEST);
            expect(calculateDragLimits.bottom).toBe($window.getHeight() - 70);
            expect(calculateDragLimits.left).toBe(10);
            expect(calculateDragLimits.right).toBeDefined(MARGIN_TO_TEST);
        }));

        it("should be able to move the panel around the screen within the boundaries", inject(function($window) {
            scope = rootScope.$new();
            elm = compile('<dialog-window draggable="true" drag-handle-class="' + defaultDragHandleClass + '"></dialog-window>')(scope);
            scope.$digest();
            var boundaries = {left: 10, top: 40, right: 1920, bottom: 1280};
            spyOn(scope, 'calculateDragLimits').and.returnValue(boundaries);
            scope.updateDragLimits();

            var event = {pageX: 1, pageY: 8};
            scope.onMouseMove(event);

            expect(elm.css('left')).toBe(boundaries.left + 'px');
            expect(elm.css('top')).toBe(boundaries.top + 'px');

            event = {pageX: 200, pageY: 300};
            scope.onMouseMove(event);

            expect(elm.css('left')).toBe('200px');
            expect(elm.css('top')).toBe('300px');

            event = {pageX: -200, pageY: 90000};
            scope.onMouseMove(event);

            expect(elm.css('left')).toBe(boundaries.left + 'px');
            expect(elm.css('top')).toBe(boundaries.bottom + 'px');
        }));
    });

    describe('Dialog dimensions', function () {
        it('should set the dialog\'s inner wrapper width if attr dialogWidth is defined', function () {
            elm = compile('<dialog-window dialog-width="100"></dialog-window>')(scope);
            scope.$digest();

            var innerChild = elm.children();
            expect(innerChild.width()).toEqual(100);
        });

        it('should set the dialog\'s inner wrapper height if attr dialogHeight is defined', inject(function () {
            elm = compile('<dialog-window dialog-height="200"></dialog-window>')(scope);
            scope.$digest();

            var innerChild = elm.children();
            expect(innerChild.height()).toEqual(200);
        }));
    });

    describe('Template URL', function () {
        it('should be default if dialogTemplateUrl attr is undefined', inject(function ($templateCache) {
            var expectedTemplate = 'angular/dialogs/ui/defaultdialogwindowtemplate.html';
            spyOn($templateCache, 'get');

            elm = compile('<dialog-window></dialog-window>')(scope);
            scope.$digest();

            expect($templateCache.get).toHaveBeenCalledWith(expectedTemplate);
        }));

        it('should be set according to dialogTemplateUrl attr (if defined)', inject(function ($templateCache) {
            var expectedTemplate = 'angular/sometemplate.html';
            spyOn($templateCache, 'get');

            elm = compile('<dialog-window dialog-template-url="someTemplate.html"></dialog-window>')(scope);
            scope.$digest();

            expect($templateCache.get).toHaveBeenCalledWith(expectedTemplate);
        }));
    });
});