/*eslint-disable new-cap, no-new */
define(['wixappsCore',
    'lodash',
    'testUtils'
], function (wixapps, _, testUtils) {
    'use strict';

    var ProductPageLogic, mockPartApi, siteApi;

    describe('Product Page Logic', function () {
        beforeEach(function () {
            siteApi = testUtils.mockFactory.mockSiteAPI();

            mockPartApi = {
                getPartData: jasmine.createSpy('getPartData').and.returnValue({
                    appInnerID: 0
                }),
                getRootDataItemRef: jasmine.createSpy('getRootDataItemRef'),
                getSiteApi: jasmine.createSpy('getSiteApi').and.returnValue(siteApi),
                getSiteData: jasmine.createSpy('getSiteData').and.returnValue(siteApi.getSiteData())
            };

            mockPartApi.getSiteApi().navigateToPage = jasmine.createSpy('navigateToPage');
        });

        describe('when there\'s a list-eCom app in the site', function () {
            beforeEach(function () {
                mockPartApi.getSiteData().getClientSpecMapEntry = jasmine.createSpy('getClientSpecMapEntry').and.returnValue({});
            });

            it('should create a product page logic object and not navigate to tpa-eCom product page', function () {
                ProductPageLogic = new wixapps.logicFactory.getLogicClass('f72a3898-8520-4b60-8cd6-24e4e20d483d');
                new ProductPageLogic(mockPartApi);
                expect(mockPartApi.getSiteApi().navigateToPage).not.toHaveBeenCalled();
            });
        });

        describe('when there\'s only tpa-eCom app in the site', function () {
            beforeEach(function () {
                mockPartApi.getSiteData().getClientSpecMapEntry = jasmine.createSpy('getClientSpecMapEntry');
                mockPartApi.getSiteData().setCurrentPage('someId', {
                    pageAdditionalData: '111111/productPage'
                });
                mockPartApi.getSiteData().getPagesDataItems = jasmine.createSpy('getPagesDataItems').and.returnValue([{
                    tpaPageId: 'product_page',
                    id: 'pageId'
                }]);
                mockPartApi.getSiteData().getClientSpecMapEntryByAppDefinitionId = jasmine.createSpy('getClientSpecMapEntryByAppDefinitionId').and.returnValue({
                    permissions: {
                        revoked: false
                    }
                });

                spyOn(_, 'defer').and.callFake(function (callback) {
                    callback();
                });
            });

            it('should navigate to tpa-eCom product page', function () {
                ProductPageLogic = new wixapps.logicFactory.getLogicClass('f72a3898-8520-4b60-8cd6-24e4e20d483d');
                new ProductPageLogic(mockPartApi);
                expect(mockPartApi.getSiteApi().navigateToPage).toHaveBeenCalled();
            });
        });
    });
});
