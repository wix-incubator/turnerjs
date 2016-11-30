define([
    'lodash', 'utils', 'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/component/component',
    'documentServices/page/page',
    'documentServices/hooks/componentHooks/wFacebookLike'
], function (_, utils, testUtils,
             privateServicesHelper,
             component,
             page,
             wFacebookLike) {
    'use strict';

    describe('wFacebookLike hook', function () {

        function addComp(siteData, showOnAllPages) {
            var pageId = showOnAllPages ? 'masterPage' : 'currentPage';

            siteData.addDesktopComps([{id: 'mockCompId', dataQuery: '#mockDataQuery'}], pageId);
            siteData.addData({id: 'mockDataQuery', type: 'WFacebookLike'}, pageId);
        }

        function getMockPrivateServices(likes, urlFormat, showOnAllPages) {
            var siteData = testUtils.mockFactory.mockSiteData();

            addComp(siteData, showOnAllPages);
            fakeSiteUrlFormat(siteData, urlFormat);
            fakeLikes(likes);

            return privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
        }

        function fakeLikes(likes) {
            spyOn(utils.socialAPI, 'facebook').and.callFake(function (url, callback) {
                callback(likes);
            });
        }

        function fakeSiteUrlFormat(siteData, urlFormat) {
            siteData.urlFormatModel = {format: urlFormat};
        }

        function getCompPointer(ps, showOnAllPages) {
            var pagePointer = ps.pointers.components.getPage(showOnAllPages ? 'masterPage' : 'currentPage', 'DESKTOP');
            return ps.pointers.components.getComponent('mockCompId', pagePointer);
        }

        function executeHook(ps, compPointer) {
            var parentPointer = ps.pointers.components.getParent(compPointer);

            wFacebookLike(ps, compPointer, {}, null, {}, parentPointer);
        }

        function getUrlFormat(ps, compPointer) {
            var dataItem = component.data.get(ps, compPointer);

            return dataItem.urlFormat;
        }

        beforeEach(function () {
            spyOn(page, 'getSocialUrl');
        });

        it('should update data with hashBang urlFormat if hash bang likes > 0 and site format is hashBang', function () {
            var mockPrivateServices = getMockPrivateServices(1, 'hashBang');
            var compPointer = getCompPointer(mockPrivateServices);
            var urlFormat;

            executeHook(mockPrivateServices, compPointer);

            urlFormat = getUrlFormat(mockPrivateServices, compPointer);
            expect(urlFormat).toEqual('hashBang');
        });

        it('should update data with hashBang urlFormat if hash bang likes > 0 and site format is slash', function () {
            var mockPrivateServices = getMockPrivateServices(1, 'slash');
            var compPointer = getCompPointer(mockPrivateServices);
            var urlFormat;

            executeHook(mockPrivateServices, compPointer);

            urlFormat = getUrlFormat(mockPrivateServices, compPointer);
            expect(urlFormat).toEqual('hashBang');
        });

        it('should update data with hashBang urlFormat if hash bang likes = 0 and site format is hashBang', function () {
            var mockPrivateServices = getMockPrivateServices(0, 'hashBang');
            var compPointer = getCompPointer(mockPrivateServices);
            var urlFormat;

            executeHook(mockPrivateServices, compPointer);

            urlFormat = getUrlFormat(mockPrivateServices, compPointer);
            expect(urlFormat).toEqual('hashBang');
        });

        it('should update data with slash urlFormat if hash bang likes = 0 and site format is slash', function () {
            var mockPrivateServices = getMockPrivateServices(0, 'slash');
            var compPointer = getCompPointer(mockPrivateServices);
            var urlFormat;

            executeHook(mockPrivateServices, compPointer);

            urlFormat = getUrlFormat(mockPrivateServices, compPointer);
            expect(urlFormat).toEqual('slash');
        });

        it('should check likes for url of home page if container is shown on all pages', function () {
            var showOnAllPages = true;
            var mockPrivateServices = getMockPrivateServices(0, 'slash', showOnAllPages);
            var compPointer = getCompPointer(mockPrivateServices, showOnAllPages);

            executeHook(mockPrivateServices, compPointer);

            expect(page.getSocialUrl).toHaveBeenCalledWith(mockPrivateServices, 'hashBang', showOnAllPages);
        });

        it('should check likes for url of current page if container is not shown on all pages', function () {
            var showOnAllPages = false;
            var mockPrivateServices = getMockPrivateServices(0, 'slash', showOnAllPages);
            var compPointer = getCompPointer(mockPrivateServices, showOnAllPages);

            executeHook(mockPrivateServices, compPointer);

            expect(page.getSocialUrl).toHaveBeenCalledWith(mockPrivateServices, 'hashBang', showOnAllPages);
        });

    });
});
