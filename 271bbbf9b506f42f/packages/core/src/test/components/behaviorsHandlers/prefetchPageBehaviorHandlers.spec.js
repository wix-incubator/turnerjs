define([
    'lodash',
    'testUtils',
    'core/components/behaviorHandlers/prefetchPagesBehaviorHandler'
], function(
    _,
    testUtils,
    prefetchPagesBehaviorHandler
) {
    'use strict';

    describe('prefetchPagesBehaviorHandler', function () {
        var behavior, mockSiteData, mockSiteAPI;

        beforeEach(function() {
            behavior = {
                type: 'site',
                name: 'prefetchPages',
                targetId: 'page1',
                params: {
                    prefetchFilters: {
                        id: ['page3']
                    }
                }
            };

            mockSiteData = testUtils.mockFactory.mockSiteData();
            mockSiteData.addPageWithData('page1', {
                tpaApplicationId: '18',
                isPopup: 'false'
            });

            mockSiteData.addPageWithData('page2', {
                tpaApplicationId: '20',
                isPopup: 'false'
            });

            mockSiteAPI = testUtils.mockFactory.mockSiteAPI(mockSiteData);
            spyOn(mockSiteData, 'addPrefetchPages');
            spyOn(mockSiteAPI, 'forceUpdate');
            spyOn(mockSiteAPI.getSiteDataAPI(), 'loadPage');

        });

        it('should do nothing if there are no pages to load', function() {
            prefetchPagesBehaviorHandler.prefetchPages(behavior, mockSiteAPI);
            expect(mockSiteAPI.getSiteDataAPI().loadPage).not.toHaveBeenCalled();
            expect(mockSiteData.addPrefetchPages).not.toHaveBeenCalled();
            expect(mockSiteAPI.forceUpdate).not.toHaveBeenCalled();
        });

        it('should load pages according to given filters', function(done) {
            var completeCallback = function() {
                expect(mockSiteData.addPrefetchPages).toHaveBeenCalledWith(['page1']);
                expect(mockSiteAPI.forceUpdate).toHaveBeenCalled();
                done();
            };
            behavior.params.prefetchFilters.id = ['page1', 'page2'];
            behavior.params.prefetchFilters.tpaApplicationId = ['18', '19'];
            mockSiteAPI.getSiteDataAPI().loadPage.and.callFake(function(pageInfo, callback) {
                callback();
                completeCallback();
            });
            prefetchPagesBehaviorHandler.prefetchPages(behavior, mockSiteAPI);
            expect(mockSiteAPI.getSiteDataAPI().loadPage).toHaveBeenCalledWith({pageId: 'page1'}, jasmine.any(Function));
        });

        it('should load few pages', function(done) {
            var calls = 0;
            var completeCallback = function() {
                if (calls === 2) {
                    expect(mockSiteData.addPrefetchPages.calls.count()).toEqual(1);
                    expect(mockSiteAPI.forceUpdate.calls.count()).toEqual(1);
                    expect(mockSiteData.addPrefetchPages).toHaveBeenCalledWith(['page1', 'page2']);
                    expect(mockSiteAPI.forceUpdate).toHaveBeenCalled();
                    done();
                }
            };
            behavior.params.prefetchFilters.id = ['page1', 'page2'];
            behavior.params.prefetchFilters.tpaApplicationId = ['18', '19', '20'];

            mockSiteAPI.getSiteDataAPI().loadPage.and.callFake(function(pageInfo, callback) {
                ++calls;
                callback();
                completeCallback();
            });
            prefetchPagesBehaviorHandler.prefetchPages(behavior, mockSiteAPI);
            expect(mockSiteAPI.getSiteDataAPI().loadPage.calls.count()).toEqual(2);
            expect(mockSiteAPI.getSiteDataAPI().loadPage.calls.argsFor(0)).toEqual([{pageId: 'page1'}, jasmine.any(Function)]);
            expect(mockSiteAPI.getSiteDataAPI().loadPage.calls.argsFor(1)).toEqual([{pageId: 'page2'}, jasmine.any(Function)]);
        });
    });
});
