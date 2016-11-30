define([
    'lodash', 'utils', 'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/component/component',
    'documentServices/page/page',
    'documentServices/hooks/componentHooks/vkShareButton'
], function (_, utils, testUtils,
             privateServicesHelper,
             component,
             page,
             vkShareButton) {
    'use strict';

    describe('vkShareButton hook', function () {

        function addComp(siteData, showOnAllPages) {
            var pageId = showOnAllPages ? 'masterPage' : 'currentPage';

            siteData.addDesktopComps([{id: 'mockCompId', dataQuery: '#mockDataQuery'}], pageId);
            siteData.addData({id: 'mockDataQuery', type: 'VKShareButton'}, pageId);
        }

        function getMockPrivateServices(likes, urlFormat, showOnAllPages) {
            var siteData = testUtils.mockFactory.mockSiteData();

            addComp(siteData, showOnAllPages);
            fakeSiteUrlFormat(siteData, urlFormat);
            fakeLikes(likes);

            return privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
        }

        function fakeLikes(likes) {
            spyOn(utils.socialAPI, 'vk').and.callFake(function (url, callback) {
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

            vkShareButton(ps, compPointer, {}, null, {}, parentPointer);
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

    });
});
