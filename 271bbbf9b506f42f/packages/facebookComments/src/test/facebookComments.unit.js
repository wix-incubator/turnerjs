define([
    'lodash', 'utils', 'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/component/component',
    'documentServices/page/page',
    'documentServices/hooks/componentHooks/wFacebookComment'
], function (_, utils, testUtils,
             privateServicesHelper,
             component,
             page,
             wFacebookComment) {
    'use strict';

    describe('wFacebookComment hook', function () {

        function addComp(siteData, showOnAllPages) {
            var pageId = showOnAllPages ? 'masterPage' : 'currentPage';

            siteData.addDesktopComps([{id: 'mockCompId', dataQuery: '#mockDataQuery'}], pageId);
            siteData.addData({id: 'mockDataQuery', type: 'WFacebookComment'}, pageId);
        }

        function getMockPrivateServices(comments, urlFormat, showOnAllPages) {
            var siteData = testUtils.mockFactory.mockSiteData();

            addComp(siteData, showOnAllPages);
            fakeSiteUrlFormat(siteData, urlFormat);
            fakeComments(comments);

            return privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
        }

        function fakeComments(comments) {
            spyOn(utils.socialAPI, 'facebook').and.callFake(function (url, callback) {
                callback(0, comments);
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

            wFacebookComment(ps, compPointer, {}, null, {}, parentPointer);
        }

        function getUrlFormat(ps, compPointer) {
            var dataItem = component.data.get(ps, compPointer);

            return dataItem.urlFormat;
        }

        beforeEach(function () {
            spyOn(page, 'getSocialUrl');
        });

        it('should update data with hashBang urlFormat if hash bang comments > 0 and site format is hashBang', function () {
            var mockPrivateServices = getMockPrivateServices(1, 'hashBang');
            var compPointer = getCompPointer(mockPrivateServices);
            var urlFormat;

            executeHook(mockPrivateServices, compPointer);

            urlFormat = getUrlFormat(mockPrivateServices, compPointer);
            expect(urlFormat).toEqual('hashBang');
        });

        it('should update data with hashBang urlFormat if hash bang comments > 0 and site format is slash', function () {
            var mockPrivateServices = getMockPrivateServices(1, 'slash');
            var compPointer = getCompPointer(mockPrivateServices);
            var urlFormat;

            executeHook(mockPrivateServices, compPointer);

            urlFormat = getUrlFormat(mockPrivateServices, compPointer);
            expect(urlFormat).toEqual('hashBang');
        });

        it('should update data with hashBang urlFormat if hash bang comments = 0 and site format is hashBang', function () {
            var mockPrivateServices = getMockPrivateServices(0, 'hashBang');
            var compPointer = getCompPointer(mockPrivateServices);
            var urlFormat;

            executeHook(mockPrivateServices, compPointer);

            urlFormat = getUrlFormat(mockPrivateServices, compPointer);
            expect(urlFormat).toEqual('hashBang');
        });

        it('should update data with slash urlFormat if hash bang comments = 0 and site format is slash', function () {
            var mockPrivateServices = getMockPrivateServices(0, 'slash');
            var compPointer = getCompPointer(mockPrivateServices);
            var urlFormat;

            executeHook(mockPrivateServices, compPointer);

            urlFormat = getUrlFormat(mockPrivateServices, compPointer);
            expect(urlFormat).toEqual('slash');
        });

    });
});
