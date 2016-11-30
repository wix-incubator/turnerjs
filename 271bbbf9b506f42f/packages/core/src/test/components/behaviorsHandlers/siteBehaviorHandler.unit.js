define([
    'lodash',
    'testUtils',
    'core/components/behaviorHandlers/siteBehaviorHandler'
], function(
    _,
    testUtils,
    siteBehaviorHandler
) {
    'use strict';

    describe('siteBehaviorHandler', function() {
        var behavior;

        beforeEach(function() {
            behavior = {
                type: 'site',
                name: 'openPopup',
                targetId: 'popup1',
                params: {
                    openInDesktop: true,
                    openInMobile: true,
                    delay: 5
                }
            };

            this.mockSiteAPI = testUtils.mockFactory.mockSiteAPI();
            this.mockSiteAPI.openPopupPage = jasmine.createSpy('openPopupPage');

            jasmine.clock().install();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        itShouldOpenPopup();

        describe("in mobile mode", function () {
            beforeEach(enterMobileMode);

            describe("when behavior is enabled in mobile", function () {
                beforeEach(overrideBehavior({openInMobile: true}));
                itShouldOpenPopup();
            });

            describe("when behavior is disabled in mobile", function () {
                beforeEach(overrideBehavior({openInMobile: false}));
                itShouldNotOpenPopup();
            });
        });

        describe("in zoom mode", function () {
            beforeEach(enterZoomMode);
            itShouldNotOpenPopup();
        });

        describe("in desktop mode", function () {
            beforeEach(enterDesktopMode);

            describe("when behavior is enabled in desktop", function () {
                beforeEach(overrideBehavior({openInDesktop: true}));
                itShouldOpenPopup();
            });

            describe("when behavior is disabled in desktop", function () {
                beforeEach(overrideBehavior({openInDesktop: false}));
                itShouldNotOpenPopup();
            });
        });

        describe("when popup has been opened", function () {
            beforeEach(markPopupAsBeenOpened);
            itShouldNotOpenPopup();
        });

        describe("when some popup is opened right now", function () {
            beforeEach(reportSomePopupIsPopupOpened);
            itShouldNotOpenPopup();
        });

        describe("in editor mode", function () {
            beforeEach(inEditorMode);
            itShouldNotOpenPopup();
        });

        describe("when unexpectedly changed", function () {
            beforeEach(function () {
                siteBehaviorHandler.handle([behavior], this.mockSiteAPI);
            });

            describe("nothing", itShouldOpenPopupAfterDelay);

            describe("page to another page", function () {
                beforeEach(function () {
                    this.mockSiteAPI.getSiteData().getPrimaryPageId = _.constant('foo');
                });

                itShouldNotOpenPopupAfterDelay();
            });

            describe("in zoom mode", function () {
                beforeEach(enterZoomMode);
                itShouldNotOpenPopupAfterDelay();
            });

            describe("in mobile mode", function () {
                beforeEach(enterMobileMode);

                describe("when behavior is disabled in mobile", function () {
                    beforeEach(overrideBehavior({openInMobile: false}));
                    itShouldNotOpenPopupAfterDelay();
                });
            });

            describe("in desktop mode", function () {
                beforeEach(enterDesktopMode);

                describe("when behavior is disabled in desktop", function () {
                    beforeEach(overrideBehavior({openInDesktop: false}));
                    itShouldNotOpenPopupAfterDelay();
                });
            });

            describe("when popup has been opened", function () {
                beforeEach(markPopupAsBeenOpened);
                itShouldNotOpenPopupAfterDelay();
            });

            describe("when some popup is opened right now", function () {
                beforeEach(reportSomePopupIsPopupOpened);
                itShouldNotOpenPopupAfterDelay();
            });

            describe("in editor mode", function () {
                beforeEach(inEditorMode);
                itShouldNotOpenPopupAfterDelay();
            });
        });

        describe("Multiple behaviors", function(){

        });

        function overrideBehavior(override) {
            return function overrideFn() {
                _.merge(behavior.params, override);
            };
        }

        function enterDesktopMode() {
            this.mockSiteAPI.getSiteData().isMobileView = _.constant(false);
        }

        function enterMobileMode() {
            this.mockSiteAPI.getSiteData().isMobileView = _.constant(true);
        }

        function enterZoomMode() {
            this.mockSiteAPI.isZoomOpened = _.constant(true);
        }

        function markPopupAsBeenOpened() {
            this.mockSiteAPI.getRuntimeDal().markPopupAsBeenOpened(behavior.targetId);
        }

        function reportSomePopupIsPopupOpened() {
            spyOn(this.mockSiteAPI, 'isPopupOpened').and.returnValue(true);
        }

        function inEditorMode() {
            this.mockSiteAPI.getSiteData().renderFlags.componentViewMode = 'editor';
        }

        function itShouldOpenPopup() {
            it('should open popup after delay', function () {
                siteBehaviorHandler.handle([behavior], this.mockSiteAPI);

                jasmine.clock().tick(behavior.params.delay * 1000 - 1);
                expect(this.mockSiteAPI.openPopupPage).not.toHaveBeenCalledWith(behavior.targetId);
                jasmine.clock().tick(1);
                expect(this.mockSiteAPI.openPopupPage).toHaveBeenCalledWith(behavior.targetId);
            });
        }

        function itShouldNotOpenPopup() {
            it('should not open popup after delay', function () {
                siteBehaviorHandler.handle([behavior], this.mockSiteAPI);

                jasmine.clock().tick(1 + behavior.params.delay * 1000);
                expect(this.mockSiteAPI.openPopupPage).not.toHaveBeenCalledWith(behavior.targetId);
            });
        }

        function itShouldOpenPopupAfterDelay() {
            it('should open popup after delay', function () {
                jasmine.clock().tick(behavior.params.delay * 1000 - 1);
                expect(this.mockSiteAPI.openPopupPage).not.toHaveBeenCalledWith(behavior.targetId);
                jasmine.clock().tick(1);
                expect(this.mockSiteAPI.openPopupPage).toHaveBeenCalledWith(behavior.targetId);
            });
        }

        function itShouldNotOpenPopupAfterDelay() {
            it('should not open popup after delay', function () {
                jasmine.clock().tick(1 + behavior.params.delay * 1000);
                expect(this.mockSiteAPI.openPopupPage).not.toHaveBeenCalledWith(behavior.targetId);
            });
        }
    });
});
