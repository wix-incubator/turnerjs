define(['tpa/aspects/TPAPageNavigationAspect', 'testUtils'], function (TPAPageNavigationAspect, testUtils) {
    'use strict';

    var comp = {
            props: {
                id: 'test-comp-id'
            }
        },
        aspect,
        aspectSiteApi;
    var factory = testUtils.mockFactory;
    describe('tpaPageNavigationAspect', function () {

        beforeEach(function () {
            comp.props.rootId = 'comp-page-id';
            comp.isMounted = jasmine.createSpy().and.returnValue(true);
            comp.sendPostMessage = jasmine.createSpy('sendPostMessage');

            var siteData = factory.mockSiteData();
            siteData.addPageWithDefaults('new-page-id')
                .addPageWithDefaults('old-page-id')
                .addPageWithDefaults('comp-page-id', [factory.createStructure('someType', {}, 'test-comp-id')]);
            siteData.setCurrentPage('old-page-id');
            aspectSiteApi = factory.mockSiteAspectSiteAPI(siteData);

            aspect = new TPAPageNavigationAspect(aspectSiteApi, 'old-page-id');

            this.navigate = function(pageId){
                siteData.setCurrentPage(pageId);
                aspect.notifyPageChanged();
            };
        });

        it('should inject tpaPageNavigationAspect module', function () {
            expect(aspect).toBeDefined();
            //expect(aspectSiteApi.registerToUrlPageChange).toHaveBeenCalled();
            expect(aspect._currentPageId).toEqual('old-page-id');
        });

        describe('when component is registered to PAGE_NAVIGATION', function () {
            it('should be notified once', function () {
                aspect.registerToPageChanged(comp, 'PAGE_NAVIGATION');

                this.navigate('new-page-id');
                //aspect.notifyPageChanged();

                expect(comp.sendPostMessage.calls.count()).toEqual(1);
                expect(comp.sendPostMessage).toHaveBeenCalledWith({
                    intent: 'addEventListener',
                    eventType: 'PAGE_NAVIGATION',
                    params: {
                        toPage: 'new-page-id',
                        fromPage: 'old-page-id',
                        isAppOnPage: false,
                        wasAppOnPage: false
                    }
                });
                expect(aspect._currentPageId).toEqual('new-page-id');
            });

            it('should be notified twice', function () {
                aspect.registerToPageChanged(comp, 'PAGE_NAVIGATION');
                aspect.registerToPageChanged(comp, 'PAGE_NAVIGATION');

                this.navigate('new-page-id');

                expect(comp.sendPostMessage.calls.count()).toEqual(2);
                expect(comp.sendPostMessage).toHaveBeenCalledWith({
                    intent: 'addEventListener',
                    eventType: 'PAGE_NAVIGATION',
                    params: {
                        toPage: 'new-page-id',
                        fromPage: 'old-page-id',
                        isAppOnPage: false,
                        wasAppOnPage: false
                    }
                });
            });
        });

        describe('when component is registered to PAGE_NAVIGATION_IN and not mounted', function () {
            beforeEach(function () {
                comp.isMounted = jasmine.createSpy().and.returnValue(false);
            });

            it('should not be notified', function () {
                aspect.registerToPageChanged(comp, 'PAGE_NAVIGATION_IN');

                this.navigate('comp-page-id');

                expect(comp.sendPostMessage).not.toHaveBeenCalled();
            });
        });

        describe('when component is registered to PAGE_NAVIGATION_IN', function () {
            it('should be notified', function () {
                aspect.registerToPageChanged(comp, 'PAGE_NAVIGATION_IN');

                this.navigate('comp-page-id');

                expect(comp.sendPostMessage).toHaveBeenCalledWith({
                    intent: 'addEventListener',
                    eventType: 'PAGE_NAVIGATION_IN',
                    params: {
                        toPage: 'comp-page-id',
                        fromPage: 'old-page-id',
                        isAppOnPage: true,
                        wasAppOnPage: false
                    }
                });
            });

            it('should not be notified', function () {
                aspect.registerToPageChanged(comp, 'PAGE_NAVIGATION_IN');

                this.navigate('new-page-id');

                expect(comp.sendPostMessage).not.toHaveBeenCalled();
            });
        });

        describe('when component is registered to PAGE_NAVIGATION_OUT', function () {
            it('should be notified', function () {
                comp.props.rootId = 'old-page-id';
                aspect.registerToPageChanged(comp, 'PAGE_NAVIGATION_OUT');

                this.navigate('new-page-id');

                expect(comp.sendPostMessage).toHaveBeenCalledWith({
                    intent: 'addEventListener',
                    eventType: 'PAGE_NAVIGATION_OUT',
                    params: {
                        toPage: 'new-page-id',
                        fromPage: 'old-page-id',
                        isAppOnPage: false,
                        wasAppOnPage: true
                    }
                });
            });

            it('should not be notified', function () {
                aspect.registerToPageChanged(comp, 'PAGE_NAVIGATION_OUT');

                this.navigate('new-page-id');

                expect(comp.sendPostMessage).not.toHaveBeenCalled();
            });
        });

        describe('unregister from pageChanged aspect event', function () {
            it('should unregister from all registered events', function () {
                aspect.registerToPageChanged(comp, 'PAGE_NAVIGATION');
                aspect.registerToPageChanged(comp, 'PAGE_NAVIGATION_IN');
                aspect.registerToPageChanged(comp, 'PAGE_NAVIGATION_OUT');

                aspect.unregisterToPageChanged(comp);

                this.navigate('comp-page-id');

                expect(comp.sendPostMessage).not.toHaveBeenCalled();
            });
        });
    });
});
