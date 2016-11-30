define(['lodash', 'definition!core/components/siteAspects/parentFrameAspect',
    'core/core/siteAspectsRegistry',
    'fake!core/siteRender/SiteAspectsSiteAPI'], function (_, parentFrameAspectDef, /** core.siteAspectsRegistry */ siteAspectsRegistry, FakeSiteAspectsSiteAPI) {
    "use strict";

    describe('parentFrameAspect spec', function () {
        var ParentFrameAspect;
        var mockAspectsSiteApi = new FakeSiteAspectsSiteAPI();
        var mockSiteData;
        var originalParent;

        beforeEach(function () {
            spyOn(siteAspectsRegistry, 'registerSiteAspect');
            mockAspectsSiteApi.registerToDidLayout = jasmine.createSpy("registerToDidLayoutSpy");
            mockAspectsSiteApi.getSiteAPI = function () {
                return {
                    getSiteData: function () {
                        return mockSiteData;
                    }
                };
            };

            ParentFrameAspect = parentFrameAspectDef(siteAspectsRegistry, _);
        });

        it('should register itself to the site aspects regsitry', function () {
            expect(siteAspectsRegistry.registerSiteAspect).toHaveBeenCalledWith('parentFrame', ParentFrameAspect);
        });

        it('should register a callback to layout event', function () {
            /*eslint no-new:0*/
            new ParentFrameAspect(mockAspectsSiteApi);

            expect(mockAspectsSiteApi.registerToDidLayout).toHaveBeenCalled();
            expect(typeof (mockAspectsSiteApi.registerToDidLayout.calls.argsFor(0)[0])).toEqual('function');
        });

        describe('notify height', function () {
            var layoutCallback;

            beforeEach(function () {
                mockAspectsSiteApi.registerToDidLayout.and.callFake(function (callback) {
                    layoutCallback = callback;
                });

                originalParent = window.parent;
                window.parent = {
                    postMessage: jasmine.createSpy('postMessageSpy')
                };

                mockSiteData = {
                    measureMap: {
                        height: {
                            masterPage: 0
                        }
                    }
                };

                /*eslint no-new:0*/
                new ParentFrameAspect(mockAspectsSiteApi);
            });

            afterEach(function(){
                window.parent = originalParent;
            });

            it('should notify height on layoutEvent', function () {
                mockSiteData.measureMap.height.masterPage = 100;

                layoutCallback();

                expect(window.parent.postMessage).toHaveBeenCalled();
            });

            it('should not notify height if it hasn\'t changed in during relayout', function () {
                mockSiteData.measureMap.height.masterPage = 100;
                layoutCallback();
                layoutCallback();

                expect(window.parent.postMessage.calls.count()).toEqual(1);
            });

            it('should not notify height if it is 0', function () {
                delete mockSiteData.measureMap.height.masterPage;

                layoutCallback();

                expect(window.parent.postMessage).not.toHaveBeenCalled();
            });

            it('should support document.postMessage', function() {
                window.parent.document = {
                    postMessage: jasmine.createSpy('documentPostMessage')
                };
                delete window.parent.postMessage;

                mockSiteData.measureMap.height.masterPage = 100;

                layoutCallback();

                expect(window.parent.document.postMessage).toHaveBeenCalled();

            });
        });
    });
});
