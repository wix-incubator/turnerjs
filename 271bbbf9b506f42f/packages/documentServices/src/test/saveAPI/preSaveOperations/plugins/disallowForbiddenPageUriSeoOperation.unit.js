define([
    'lodash',
    'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/saveAPI/preSaveOperations/plugins/disallowForbiddenPageUriSeoOperation'
], function (_, testUtils, privateServicesHelper, disallowDuplicatePageUriSeoOperation) {
    'use strict';

    describe('disallowForbiddenPageUriSeoOperation', function () {

        var mockPrivateServices;

        function getMockPageData(pageUriSEO) {
            return {
                pageUriSEO: pageUriSEO
            };
        }

        function getMockPrivateServicesWithPages(pageUriSEOs) {
            var siteData = testUtils.mockFactory.mockSiteData();

            _.forEach(pageUriSEOs, function (pageUriSEO, index) {
                var id = 'page-' + index;
                siteData.addPageWithData(id, getMockPageData(pageUriSEO));
            });

            siteData.urlFormatModel = {
                format: 'slash',
                forbiddenPageUriSEOs: {a: true, c: true}
            };

            return privateServicesHelper.mockPrivateServicesWithRealDAL(siteData, {siteData: [{path: ['urlFormatModel'], optional: true}]});
        }

        it('should throw descriptive error if some pageUriSEO are forbidden', function () {
            mockPrivateServices = getMockPrivateServicesWithPages(['a', 'b', 'c', 'd', 'e']);
            expect(function () {
                disallowDuplicatePageUriSeoOperation(mockPrivateServices);
            }).toThrow(new Error('Found pages with forbidden url title: ["a","c"]'));
        });

        it('should not throw error if all pageUriSEO not forbidden', function () {
            mockPrivateServices = getMockPrivateServicesWithPages(['b', 'd', 'e']);
            expect(function () {
                disallowDuplicatePageUriSeoOperation(mockPrivateServices);
            }).not.toThrow();
        });

    });
});
