define([
    'lodash', 'utils', 'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/component/component',
    'documentServices/page/page',
    'documentServices/hooks/componentHooks/facebookShare'
], function (_, utils, testUtils,
             privateServicesHelper,
             component,
             page,
             facebookShare) {
    'use strict';

    describe('facebookShare hook', function () {

        function addComp(siteData, urlChoice) {
            siteData.addDesktopComps([{id: 'mockCompId', dataQuery: '#mockDataQuery'}], 'masterPage');
            siteData.addData({id: 'mockDataQuery', type: 'FacebookShareButton', urlChoice: urlChoice || 'Site'}, 'masterPage');
        }

        function getMockPrivateServices(shares, urlFormat, urlChoice) {
            var siteData = testUtils.mockFactory.mockSiteData();

            addComp(siteData, urlChoice);
            fakeSiteUrlFormat(siteData, urlFormat);
            fakeShares(shares);

            return privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
        }

        function fakeShares(shares) {
            spyOn(utils.socialAPI, 'facebook').and.callFake(function (url, callback) {
                callback(shares);
            });
        }

        function fakeSiteUrlFormat(siteData, urlFormat) {
            siteData.urlFormatModel = {format: urlFormat};
        }

        function getCompPointer(ps) {
            var pagePointer = ps.pointers.components.getPage('masterPage', 'DESKTOP');
            return ps.pointers.components.getComponent('mockCompId', pagePointer);
        }

        function executeHook(ps, compPointer) {
            var parentPointer = ps.pointers.components.getParent(compPointer);

            facebookShare(ps, compPointer, {}, null, {}, parentPointer);
        }

        function getUrlFormat(ps, compPointer) {
            var dataItem = component.data.get(ps, compPointer);

            return dataItem.urlFormat;
        }

        beforeEach(function () {
            spyOn(page, 'getSocialUrl');
        });

        it('should update data with hashBang urlFormat if hash bang shares > 0 and site format is hashBang', function () {
            var mockPrivateServices = getMockPrivateServices(1, 'hashBang');
            var compPointer = getCompPointer(mockPrivateServices);
            var urlFormat;

            executeHook(mockPrivateServices, compPointer);

            urlFormat = getUrlFormat(mockPrivateServices, compPointer);
            expect(urlFormat).toEqual('hashBang');
        });

        it('should update data with hashBang urlFormat if hash bang shares > 0 and site format is slash', function () {
            var mockPrivateServices = getMockPrivateServices(1, 'slash');
            var compPointer = getCompPointer(mockPrivateServices);
            var urlFormat;

            executeHook(mockPrivateServices, compPointer);

            urlFormat = getUrlFormat(mockPrivateServices, compPointer);
            expect(urlFormat).toEqual('hashBang');
        });

        it('should update data with hashBang urlFormat if hash bang shares = 0 and site format is hashBang', function () {
            var mockPrivateServices = getMockPrivateServices(0, 'hashBang');
            var compPointer = getCompPointer(mockPrivateServices);
            var urlFormat;

            executeHook(mockPrivateServices, compPointer);

            urlFormat = getUrlFormat(mockPrivateServices, compPointer);
            expect(urlFormat).toEqual('hashBang');
        });

        it('should update data with slash urlFormat if hash bang shares = 0 and site format is slash', function () {
            var mockPrivateServices = getMockPrivateServices(0, 'slash');
            var compPointer = getCompPointer(mockPrivateServices);
            var urlFormat;

            executeHook(mockPrivateServices, compPointer);

            urlFormat = getUrlFormat(mockPrivateServices, compPointer);
            expect(urlFormat).toEqual('slash');
        });

        it('should check shares for url of home page data.urlChoice is "Site"', function () {
            var mockPrivateServices = getMockPrivateServices(0, 'slash', 'Site');
            var compPointer = getCompPointer(mockPrivateServices);

            executeHook(mockPrivateServices, compPointer);

            expect(page.getSocialUrl).toHaveBeenCalledWith(mockPrivateServices, 'hashBang', true);
        });

        it('should check shares for url of current page if data.urlChoice is "Current page"', function () {
            var mockPrivateServices = getMockPrivateServices(0, 'slash', 'Current page');
            var compPointer = getCompPointer(mockPrivateServices);

            executeHook(mockPrivateServices, compPointer);

            expect(page.getSocialUrl).toHaveBeenCalledWith(mockPrivateServices, 'hashBang', false);
        });

    });
});
