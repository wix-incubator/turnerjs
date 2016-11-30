define(['lodash', 'testUtils', 'documentServices/mockPrivateServices/MockPrivateServices', 'documentServices/wixapps/utils/pathUtils'], function (_, testUtils, MockPrivateServices, pathUtils) {
    'use strict';

    xdescribe('pathUtils', function () {

        function createPrivateServices(wixappsData) {
            var siteData = testUtils.mockFactory.mockSiteData();
            siteData.wixapps = wixappsData;
            return new MockPrivateServices(undefined, siteData, true);
        }

        var emptyWixappsData;
        beforeEach(function() {
            emptyWixappsData = {
                appbuilder: {
                    descriptor: {
                        parts: {},
                        views: {},
                        types: {},
                        dataSelectors: {},
                        pages: {}
                    },
                    items: {},
                    deletedItems: {}
                }
            };
        });

        describe('initBasePaths', function() {

            it('should initialize all base path in site data', function() {
                var ps = createPrivateServices({});
                pathUtils.initBasePaths(ps);
                var wixAppsSiteData = ps.dal.getByPath(['wixapps']);
                expect(wixAppsSiteData).toEqual(emptyWixappsData);
            });

            it('should not erase exiting data', function() {
                var existingWixAppsData = {
                    blog: {
                        fake: 'fake blog data'
                    },
                    appbuilder: {
                        descriptor: {
                            types: {
                                fake: 'fake type'
                            }
                        },
                        items: {
                            fake: 'fake item'
                        }
                    }
                };
                var expectedWixAppsData = _.merge({}, emptyWixappsData, existingWixAppsData);
                var ps = createPrivateServices(existingWixAppsData);
                pathUtils.initBasePaths(ps);
                var wixAppsSiteData = ps.dal.getByPath(['wixapps']);
                expect(wixAppsSiteData).toEqual(expectedWixAppsData);
            });

        });

    });
});