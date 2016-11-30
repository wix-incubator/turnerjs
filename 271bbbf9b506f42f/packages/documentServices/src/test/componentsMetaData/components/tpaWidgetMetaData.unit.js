define(['testUtils',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/componentsMetaData/components/tpaWidgetMetaData'],
    function (testUtils, privateServicesHelper, tpaWidgetMetaData) {
        'use strict';

        describe('tpaWidgetMetadata', function () {
            var mockPrivateServices, comp, appData, compData, mockSiteData, pageId;

            beforeEach(function () {
                compData = {
                    'id': 'dataItem-iv0v5x84',
                    'widgetId': '142bb34d-3439-576a-7118-683e690a1e0d',
                    'applicationId': '3353',
                    'type': 'TPAWidget',
                    'metaData': {
                        'isPreset': false,
                        'schemaVersion': '1.0',
                        'isHidden': false
                    },
                    'referenceId': ''
                };
                appData = {
                    'type': 'editor',
                    'applicationId': 3353,
                    'appDefinitionId': '14271d6f-ba62-d045-549b-ab972ae1f70e',
                    'appDefinitionName': 'Wix Pro Gallery',
                    'instance': 'Dq40JySdqZUS0dgLjLGUHXwyCiobsDVW3GjduxppfH4.eyJpbnN0YW5jZUlkIjoiNWYxMTQyMjktNTk4ZS00ZWYzLWExZjItN2JhZWEyMjFjZjRiIiwic2lnbkRhdGUiOiIyMDE2LTExLTAyVDEyOjE3OjM2LjIxMloiLCJ1aWQiOiI3YTkzMjViZS05MmI5LTRkOGItOTJmZC1mMzk5NDRhZWUxZGYiLCJwZXJtaXNzaW9ucyI6Ik9XTkVSIiwiaXBBbmRQb3J0IjoiOTEuMTk5LjExOS4yNTQvNTE2NDEiLCJ2ZW5kb3JQcm9kdWN0SWQiOm51bGwsImRlbW9Nb2RlIjpmYWxzZSwiYmlUb2tlbiI6IjExNmYzM2RmLTdkMDYtMDRkMC0zYWY5LTY4NzFhODU0NjFmZSIsInNpdGVPd25lcklkIjoiN2E5MzI1YmUtOTJiOS00ZDhiLTkyZmQtZjM5OTQ0YWVlMWRmIn0',
                    'appWorkerUrl': 'http://progallery.wix.com/worker.html',
                    'sectionPublished': true,
                    'sectionMobilePublished': false,
                    'sectionSeoEnabled': true,
                    'widgets': {
                        '142bb34d-3439-576a-7118-683e690a1e0d': {
                            'widgetId': '142bb34d-3439-576a-7118-683e690a1e0d',
                            'shouldBeStretchedByDefaultMobile': true
                        }
                    }
                };

                mockSiteData = testUtils.mockFactory.mockSiteData().updateClientSpecMap(appData);
                mockPrivateServices = privateServicesHelper.mockPrivateServices(mockSiteData);
                pageId = mockSiteData.getCurrentUrlPageId();
                comp = testUtils.mockFactory.mockComponent('tpa.viewer.components.tpapps.TPAWidget', mockSiteData, pageId, {data: compData});
            });

            it('should return true for stretchHorizontally if app is marked as stretched by default on mobile', function () {
                var stretchHorizontally = tpaWidgetMetaData.mobileConversionConfig.stretchHorizontally(mockPrivateServices, comp, 'mainPage');

                expect(stretchHorizontally).toBe(true);
            });

            it('should return false for stretchHorizontally if app is not marked as stretched by default on mobile', function () {
                appData.widgets['142bb34d-3439-576a-7118-683e690a1e0d'].shouldBeStretchedByDefaultMobile = false;

                var stretchHorizontally = tpaWidgetMetaData.mobileConversionConfig.stretchHorizontally(mockPrivateServices, comp, 'mainPage');

                expect(stretchHorizontally).toBe(false);
            });

            it('should return false if comp is not tpa', function () {
                var comp2 = testUtils.mockFactory.mockComponent('tpa.viewer.components.tpapps.TPAWidget', mockSiteData, pageId, {data: {'id': 'dataItem-iv0v5x84'}});
                var stretchHorizontally = tpaWidgetMetaData.mobileConversionConfig.stretchHorizontally(mockPrivateServices, comp2, 'mainPage');

                expect(stretchHorizontally).toBe(false);
            });
        });
    });
