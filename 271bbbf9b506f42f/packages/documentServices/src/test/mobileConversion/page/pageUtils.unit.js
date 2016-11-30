define(['lodash', 'testUtils', 'documentServices/mockPrivateServices/privateServicesHelper', 'documentServices/page/pageUtils'], function (_, testUtils, privateServicesHelper, pageUtils) {
    'use strict';

    describe('pageUtils', function () {

        var mockPrivateServices;
        var mockPageId = 'mockPageId';

        beforeEach(function () {
            var siteData = testUtils.mockFactory.mockSiteData()
                .addPageWithDefaults('mockPageId1')
                .addPageWithDefaults('mockPageId2')
                .addPageWithDefaults('mockPageId3');
            mockPrivateServices = privateServicesHelper.mockPrivateServices(siteData);
        });

        describe('getHomepageId + isHomepage', function () {

            beforeEach(function () {
                mockPrivateServices = privateServicesHelper.mockPrivateServices();
                spyOn(mockPrivateServices.siteAPI, 'getMainPageId').and.returnValue(mockPageId);
            });

            it('should return correct homepageId', function () {
                var homepageId = pageUtils.getHomepageId(mockPrivateServices);

                expect(homepageId).toBe(mockPageId);
            });

            it('should return true if pageId is of the homepageId', function () {
                expect(pageUtils.isHomepage(mockPrivateServices, mockPageId)).toBeTruthy();
            });

            it('should return false if pageId is of the homepageId', function () {
                expect(pageUtils.isHomepage(mockPrivateServices, 'someOtherId')).toBeFalsy();
            });

        });

        describe('isMasterPage', function () {

            it('should return true if pageId is "masterPage"', function () {
                expect(pageUtils.isMasterPage(mockPrivateServices, 'masterPage')).toBeTruthy();
            });

            it('should return false if pageId is not "masterPage"', function () {
                expect(pageUtils.isMasterPage(mockPrivateServices, 'someOtherId')).toBeFalsy();
            });

        });

        describe('convertPageNameToUrl', function () {

            it('should convert characters to lower case', function () {
                expect(pageUtils.convertPageNameToUrl(null, 'ABCD')).toBe('abcd');
            });

            it('should replace non words characters with a single dash', function () {
                expect(pageUtils.convertPageNameToUrl(null, 'this****%is.....a_sentence')).toBe('this-is-a-sentence');
            });

            it('should remove dash in the beginning and end of the string', function () {
                expect(pageUtils.convertPageNameToUrl(null, '----foo-bar----')).toBe('foo-bar');
            });

            it('should remove consecutive dashes', function () {
                expect(pageUtils.convertPageNameToUrl(null, 'foo---------bar')).toBe('foo-bar');
            });

            it('should transliterate non a-to-z characters', function () {
                expect(pageUtils.convertPageNameToUrl(null, 'Schöner Titel läßt grüßen')).toBe('schoener-titel-laesst-gruessen');
            });

            it('should return a default "blank" in case the given title is null or empty', function(){
                expect(pageUtils.convertPageNameToUrl(null, '')).toBe('blank');
                expect(pageUtils.convertPageNameToUrl(null, null)).toBe('blank');
                expect(pageUtils.convertPageNameToUrl(null)).toBe('blank');
            });
        });
    });
});
