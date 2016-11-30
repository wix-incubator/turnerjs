define(['lodash', 'testUtils', 'documentServices/mockPrivateServices/privateServicesHelper', 'documentServices/siteMetadata/compatibility'],
    function (_, testUtils, privateServicesHelper, compatibility) {
    'use strict';

    describe('compatibility', function () {

        var mockPrivateServices;

        function getMockPrivateServices(siteData) {
            return privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
        }

        function getMockSiteDataWithDataItemInMasterPage(dataItem) {
            return privateServicesHelper.getSiteDataWithPages({
                masterPage: {
                    data: {
                        mockId: _.assign(dataItem, {id: 'mockId'})
                    }
                }
            });
        }

        function getMockSiteDataWithAppsInClientSpecMap(apps) {
            var siteData = testUtils.mockFactory.mockSiteData();
            siteData.rendererModel.clientSpecMap = apps;
            return siteData;
        }

        function addAppPartCompWithInnerId(siteData, innerId) {
            siteData.pagesData = {
                masterPage: {
                    structure: {
                        children: []
                    }
                },
                mainPage: {
                    data: {
                        document_data: {
                            mockDataId: {
                                type: 'AppPart',
                                appInnerID: innerId
                            }
                        }
                    },
                    structure: {
                        id: 'mainPage',
                        components: [
                            {
                                id: 'mockCompId',
                                componentType: 'wixapps.integration.components.AppPart',
                                dataQuery: '#mockDataId'
                            }
                        ]
                    }
                }
            };
            siteData.getPrimaryPageId = function () {
                return 'mainPage';
            };
        }

        it('hasAppPage', function () {
            var dataItem = {type: 'AppPage', appPageType: 'AppBuilderPage'};
            var siteData = getMockSiteDataWithDataItemInMasterPage(dataItem);
            mockPrivateServices = getMockPrivateServices(siteData);
            expect(compatibility.hasAppPage(mockPrivateServices)).toBeTruthy();
        });

        describe('hasOldApp', function () {
            it('should return false if client spec map doesnt have any of [news, ecommerce, menu, faq]', function () {
                var apps = {};
                var siteData = getMockSiteDataWithAppsInClientSpecMap(apps);
                mockPrivateServices = getMockPrivateServices(siteData);
                expect(compatibility.hasOldApp(mockPrivateServices)).toBeFalsy();
            });

            it('should return false if client spec map does have any of [news, ecommerce, menu, faq], but not registered', function () {
                var apps = {1: {type: 'wixapps', packageName: 'news', applicationId:'1'}};
                var siteData = getMockSiteDataWithAppsInClientSpecMap(apps);

                addAppPartCompWithInnerId(siteData, 2);

                mockPrivateServices = getMockPrivateServices(siteData);
                expect(compatibility.hasOldApp(mockPrivateServices)).toBeFalsy();
            });

            it('should return true if client spec map has any of [news, ecommerce, menu, faq], and it\'s also registered', function () {
                var apps = {1: {type: 'wixapps', packageName: 'news', applicationId:'1'}};
                var siteData = getMockSiteDataWithAppsInClientSpecMap(apps);

                addAppPartCompWithInnerId(siteData, 1);

                mockPrivateServices = getMockPrivateServices(siteData);
                expect(compatibility.hasOldApp(mockPrivateServices)).toBeTruthy();
            });
        });
    });
});
