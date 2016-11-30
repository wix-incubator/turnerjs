define([
    'lodash',
    'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/saveAPI/preSaveOperations/plugins/disallowDuplicatePageUriSeoOperation'
], function (_, testUtils, privateServicesHelper, disallowDuplicatePageUriSeoOperation) {
    'use strict';

    describe('disallowDuplicatePageUriSeoOperation', function () {

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

            siteData.urlFormatModel = {format: 'slash'};

            return privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
        }

        it('should throw descriptive error if some pageUriSEO values are not unique', function () {
            mockPrivateServices = getMockPrivateServicesWithPages(['a', 'b', 'b', 'c', 'd', 'd', 'd', 'e']);
            expect(function () {
                disallowDuplicatePageUriSeoOperation(mockPrivateServices);
            }).toThrow(new Error('Found pages with duplicate url title: {"b":2,"d":3}'));
        });

        it('should not throw error if all pageUriSEO values are unique', function () {
            mockPrivateServices = getMockPrivateServicesWithPages(['a', 'b', 'c', 'd', 'e']);
            expect(function () {
                disallowDuplicatePageUriSeoOperation(mockPrivateServices);
            }).not.toThrow();
        });

    });
});
