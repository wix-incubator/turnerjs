define([
    'lodash', 'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/page/pageProperties'
], function
    (_, testUtils,
     privateServicesHelper,
     pageProperties
     ) {
    'use strict';

    var siteData, ps;

    function pointer(pageId, type) {
        return {
            id: pageId,
            type: type
        };
    }

    describe('Page properties', function () {

        beforeEach(function () {
            siteData = testUtils.mockFactory.mockSiteData();
            ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
        });


        describe('getPageProperties', function () {
            it('should return props for given device', function () {
                var pageId = 'page1';
                var desktopProps = {a: 1, b: 2};
                var pageProps = {
                    id: pageId,
                    type: 'PageProperties',
                    desktop: desktopProps
                };

                siteData
                    .addPageWithDefaults(pageId)
                    .addProperties(_.clone(pageProps), pageId);
                siteData.pagesData[pageId].structure.propertyQuery = pageId;

                ps.syncDisplayedJsonToFull();

                var actualDProps = pageProperties.getPageProperties(ps, pointer(pageId, 'DESKTOP'));

                expect(actualDProps).toEqual(desktopProps);
            });
        });

        function getPageProps(pageId) {
            return siteData.pagesData[pageId].data.component_properties[pageId];
        }

        describe('updatePageProperties', function () {
            it('should set direct device property', function () {
                var pageId = 'page1';
                var desktopPropsToSet = {a: 1, b: 2};
                var pageProps = {
                    id: pageId,
                    type: 'PageProperties',
                    desktop: {}
                };

                siteData
                    .addPageWithDefaults(pageId)
                    .addProperties(_.clone(pageProps), pageId);
                siteData.pagesData[pageId].structure.propertyQuery = pageId;

                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);


                pageProperties.updatePageProperties(ps, pointer(pageId, 'DESKTOP'), _.clone(desktopPropsToSet));
                var actual = getPageProps(pageId);


                expect(actual.desktop).toEqual(desktopPropsToSet);
            });

            it('should merge device properties', function () {
                var pageId = 'page1';
                var desktopPropsToSet = {a: 1, b: 2};
                var permanentDesktop = {x: 3, y: 4};
                var pageProps = {
                    id: pageId,
                    type: 'PageProperties',
                    desktop: _.clone(permanentDesktop)
                };

                siteData
                    .addPageWithDefaults(pageId)
                    .addProperties(_.clone(pageProps), pageId);
                siteData.pagesData[pageId].structure.propertyQuery = pageId;

                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);


                pageProperties.updatePageProperties(ps, pointer(pageId, 'DESKTOP'), _.clone(desktopPropsToSet));
                var actual = getPageProps(pageId);


                expect(actual.desktop).toEqual(_.assign({}, permanentDesktop, desktopPropsToSet));
            });

            it('should override device props when merging', function () {
                var pageId = 'page1';
                var desktopPropsToSet = {b: 99};
                var permanentDesktop = {a: 1, b: 2};
                var pageProps = {
                    id: pageId,
                    type: 'PageProperties',
                    desktop: _.clone(permanentDesktop)
                };

                siteData
                    .addPageWithDefaults(pageId)
                    .addProperties(_.clone(pageProps), pageId);
                siteData.pagesData[pageId].structure.propertyQuery = pageId;

                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);


                pageProperties.updatePageProperties(ps, pointer(pageId, 'DESKTOP'), _.clone(desktopPropsToSet));
                var actual = getPageProps(pageId);


                expect(actual.desktop).toEqual(_.assign({}, permanentDesktop, desktopPropsToSet));
            });

            it('should create new properties item with correct type when there is none', function () {
                var pageId = 'page1';
                var propsToSet = {someProp: 99};

                siteData.addPageWithDefaults(pageId);
                siteData.pagesData[pageId].structure.propertyQuery = pageId;

                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);


                pageProperties.updatePageProperties(ps, pointer(pageId, 'DESKTOP'), _.clone(propsToSet));
                var actual = getPageProps(pageId);
                var expectedPageProperties = {
                    type: 'PageProperties',
                    desktop: propsToSet
                };

                expect(actual.type).toEqual(expectedPageProperties.type);
                expect(actual.desktop).toEqual(expectedPageProperties.desktop);
            });
        });
    });
});
