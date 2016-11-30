define([
    'lodash',
    'experiment',
    'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/page/pageData',
    'documentServices/page/popupUtils',
    'documentServices/constants/constants'
], function (_,
             experiment,
             testUtils,
             privateServicesHelper,
             pageData,
             popupUtils,
             constants) {
    'use strict';

    function getPrivateServices(pageUriSEOs, format, forbidden) {
        var mockSiteData = testUtils.mockFactory.mockSiteData();

        mockSiteData.addData({
            id: 'CUSTOM_MAIN_MENU',
            type: 'CustomMenu',
            items: []
        });

        mockSiteData.urlFormatModel = {
            format: format || 'slash',
            forbiddenPageUriSEOs: {'reserved-word': true}
        };

        if (forbidden) {
            mockSiteData.urlFormatModel.forbiddenPageUriSEOs[forbidden] = true;
        }

        _.forEach(pageUriSEOs, function (pageUriSEO) {
            var id = pageUriSEO + '-id';
            mockSiteData.addPageWithData(id, {title: pageUriSEO, pageUriSEO: pageUriSEO});
        });

        return privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData, {
            siteData: [{
                path: ['urlFormatModel'],
                optional: true
            }]
        });
    }

    describe('pageData', function () {

        var mockPrivateServices;
        var siteData;

        function createMockPrivateServicesWithPages(pagesId) {
            var pages = _.transform(pagesId, function (result, pageId) {
                result[pageId] = {
                    components: [{id: 'comp'}]
                };
            }, {});

            siteData = privateServicesHelper.getSiteDataWithPages(pages);

            _.forEach(pagesId, function (pageId) {
                siteData.addData({
                    id: pageId,
                    data: 'PAGE_DATA_' + pageId,
                    type: 'Page'
                }, 'masterPage');
            });

            mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData, {
                siteData: [{
                    path: ['urlFormatModel'],
                    optional: true
                }]
            });
        }

        describe('getPagesDataItems', function () {
            it('should not return masterPage data', function () {
                var pageId = 'page1';
                createMockPrivateServicesWithPages([pageId]);
                var pagesData = pageData.getPagesDataItems(mockPrivateServices);
                var pages = _.map(pagesData, 'id');

                expect(pages).not.toContain('masterPage');
                expect(pages).toContain(pageId);
            });
            it('should return the data item itself for each page', function () {

                createMockPrivateServicesWithPages(['page1']);

                var pagesData = pageData.getPagesDataItems(mockPrivateServices);
                expect(pagesData[0]).toEqual({
                    id: 'page1',
                    data: 'PAGE_DATA_page1',
                    type: 'Page'
                });
            });

        });
        describe('popups', function () {

            describe('getPopupsDataItems:', function () {
                function setPopupIdsList(list) {
                    pageData.getPopupsList.and.returnValue(list);
                }

                beforeEach(function () {
                    spyOn(pageData, 'getPopupsList').and.returnValue([]);
                    spyOn(pageData, 'getPageData');
                });

                it('should get popup ids list', function () {
                    pageData.getPopupsDataItems('privateServices');
                    expect(pageData.getPopupsList).toHaveBeenCalledWith('privateServices');

                    pageData.getPopupsDataItems('otherServices');
                    expect(pageData.getPopupsList).toHaveBeenCalledWith('otherServices');
                });

                it('should get page data for each popup', function () {
                    setPopupIdsList(['popup1']);
                    pageData.getPopupsDataItems('privateServices');
                    expect(pageData.getPageData).toHaveBeenCalledWith('privateServices', 'popup1');

                    setPopupIdsList(['popup2']);
                    pageData.getPopupsDataItems('ps');
                    expect(pageData.getPageData).toHaveBeenCalledWith('ps', 'popup2');

                    pageData.getPageData.calls.reset();
                    setPopupIdsList(['popup1', 'popup2']);
                    pageData.getPopupsDataItems('ps');
                    expect(pageData.getPageData).toHaveBeenCalledWith('ps', 'popup2');
                    expect(pageData.getPageData).toHaveBeenCalledWith('ps', 'popup1');
                });

                it('should return an array of data for each popup', function () {
                    pageData.getPageData.and.callFake(function (ps, popupId) {
                        return popupId + 'Data';
                    });

                    setPopupIdsList([]);
                    expect(pageData.getPopupsDataItems({})).toEqual([]);

                    setPopupIdsList(['popup1']);
                    expect(pageData.getPopupsDataItems({})).toEqual(['popup1Data']);

                    setPopupIdsList(['popup1', 'popup2']);
                    expect(pageData.getPopupsDataItems({})).toEqual(['popup1Data', 'popup2Data']);
                });
            });
        });

        describe('getNumberOfPages', function () {

            it('should return 0 if no pages found', function () {
                createMockPrivateServicesWithPages([]);

                expect(pageData.getNumberOfPages(mockPrivateServices)).toBe(0);
            });

            it('should return number of pages', function () {
                createMockPrivateServicesWithPages(['page1', 'page2', 'page3']);

                expect(pageData.getNumberOfPages(mockPrivateServices)).toBe(3);
            });

        });

        describe('doesPageExist', function () {

            it('should return true if page exists', function () {
                createMockPrivateServicesWithPages(['page1', 'page2']);

                expect(pageData.doesPageExist(mockPrivateServices, 'page1')).toBeTruthy();
                expect(pageData.doesPageExist(mockPrivateServices, 'page2')).toBeTruthy();
            });

            it('should return false if page does not exist', function () {
                createMockPrivateServicesWithPages(['page1']);

                expect(pageData.doesPageExist(mockPrivateServices, 'page2')).toBeFalsy();
            });

        });

        describe('getPagesList:', function () {
            var pagePointers;

            function setPagePointersSpy(pagePointersList) {
                pagePointers.getNonDeletedPagesPointers.and.returnValue(pagePointersList);
            }

            beforeEach(function () {
                createMockPrivateServicesWithPages();
                pagePointers = mockPrivateServices.pointers.page;
                spyOn(pagePointers, 'getNonDeletedPagesPointers').and.returnValue([]);
            });

            it('should get non deleted page pointers', function () {
                pageData.getPagesList(mockPrivateServices, true);
                expect(pagePointers.getNonDeletedPagesPointers).toHaveBeenCalledWith(true);

                pageData.getPagesList(mockPrivateServices, false);
                expect(pagePointers.getNonDeletedPagesPointers).toHaveBeenCalledWith(false);
            });

            it('should return array of page ids', function () {
                setPagePointersSpy([]);
                expect(pageData.getPagesList(mockPrivateServices, false)).toEqual([]);

                setPagePointersSpy([{id: 'page1'}]);
                expect(pageData.getPagesList(mockPrivateServices, false)).toEqual(['page1']);

                setPagePointersSpy([{id: 'page1'}, {id: 'page2'}]);
                expect(pageData.getPagesList(mockPrivateServices, false)).toEqual(['page1', 'page2']);
            });

            it('should check each page if it is popup page', function () {
                setPagePointersSpy([{id: 'page1'}]);
                spyOn(popupUtils, 'isPopup');
                pageData.getPagesList(mockPrivateServices, false);
                expect(popupUtils.isPopup.calls.argsFor(0)[1]).toBe('page1');

                popupUtils.isPopup.calls.reset();

                setPagePointersSpy([{id: 'page1'}, {id: 'page2'}]);
                pageData.getPagesList(mockPrivateServices, false);
                expect(popupUtils.isPopup.calls.argsFor(0)[1]).toBe('page1');
                expect(popupUtils.isPopup.calls.argsFor(1)[1]).toBe('page2');
            });

            it('should filter popup pages out from resulted list', function () {
                spyOn(popupUtils, 'isPopup').and.callFake(function (ps, pageId) {
                    return pageId === 'popup';
                });
                setPagePointersSpy([{id: 'popup'}]);
                expect(pageData.getPagesList(mockPrivateServices, false)).toEqual([]);

                setPagePointersSpy([{id: 'popup'}, {id: 'page'}]);
                expect(pageData.getPagesList(mockPrivateServices, false)).toEqual(['page']);
            });
        });

        describe('getPopupsList:', function () {
            var pagePointers;

            function setPagePointersSpy(pagePointersList) {
                pagePointers.getNonDeletedPagesPointers.and.returnValue(pagePointersList);
            }

            beforeEach(function () {
                createMockPrivateServicesWithPages();
                pagePointers = mockPrivateServices.pointers.page;
                spyOn(pagePointers, 'getNonDeletedPagesPointers').and.returnValue([]);

                spyOn(popupUtils, 'isPopup').and.callFake(function (ps, pageId) {
                    return pageId === 'popup';
                });
            });

            it('should get non deleted page pointers', function () {
                pageData.getPopupsList(mockPrivateServices);
                expect(pagePointers.getNonDeletedPagesPointers).toHaveBeenCalled();
            });

            it('should check each page if it is popup', function () {
                setPagePointersSpy([{id: 'popup1'}]);
                pageData.getPopupsList(mockPrivateServices);
                expect(popupUtils.isPopup.calls.argsFor(0)[1]).toBe('popup1');

                popupUtils.isPopup.calls.reset();

                setPagePointersSpy([{id: 'popup1'}, {id: 'page2'}]);
                pageData.getPopupsList(mockPrivateServices);
                expect(popupUtils.isPopup.calls.argsFor(0)[1]).toBe('popup1');
                expect(popupUtils.isPopup.calls.argsFor(1)[1]).toBe('page2');
            });

            it('should return array of only popups', function () {
                setPagePointersSpy([]);
                expect(pageData.getPopupsList(mockPrivateServices)).toEqual([]);

                setPagePointersSpy([{id: 'popup'}]);
                expect(pageData.getPopupsList(mockPrivateServices)).toEqual(['popup']);

                setPagePointersSpy([{id: 'popup'}, {id: 'page2'}]);
                expect(pageData.getPopupsList(mockPrivateServices)).toEqual(['popup']);
            });

            it('should return array of both popups and pages', function () {
                setPagePointersSpy([{id: 'popup'}, {id: 'page2'}]);
                expect(pageData.getPagesList(mockPrivateServices, false, true)).toEqual(['popup', 'page2']);
            });
        });


        describe('isPopup', function () {

            function addPageWithPopup(pageId, isPopup) {
                createMockPrivateServicesWithPages([pageId]);
                siteData.addData({
                    id: pageId,
                    isPopup: isPopup,
                    "type": "Page",
                    dataQuery: '#' + pageId
                }, 'masterPage');
            }

            it('should return true when siteData contains isPopup', function () {
                var thePageId = 'asd';
                addPageWithPopup(thePageId, true);
                expect(popupUtils.isPopup(mockPrivateServices, thePageId)).toBe(true);
            });

            it('should return false when isPopup is false in pageData', function () {
                var thePageId = 'asd';
                addPageWithPopup(thePageId, false);
                expect(popupUtils.isPopup(mockPrivateServices, thePageId)).toBe(false);
            });
        });

        describe('removePageData', function () {
            it('should remove the pageBackrounds data recursively', function () {
                var mockPages = {
                    mockPageId: {
                        components: [],
                        data: {}
                    }
                };
                var mockData = {
                    mockPageId: {
                        pageBackgrounds: {
                            desktop: {
                                ref: '#bg_ref'
                            }
                        }
                    },
                    bg_ref: {
                        innerRef: '#innerData'
                    },
                    innerData: 'mockInnerData'
                };
                siteData = privateServicesHelper.getSiteDataWithPages(mockPages);

                _.forOwn(mockData, function (data, dataId) {
                    siteData.addData(_.merge(data, {
                            id: dataId
                        }),
                        'masterPage');
                });

                mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                var pageDataPointer = mockPrivateServices.pointers.data.getDataItem('mockPageId', 'masterPage');
                var innerDataPointer = mockPrivateServices.pointers.data.getDataItem('innerData', 'masterPage');
                var bgRefDataPointer = mockPrivateServices.pointers.data.getDataItem('bg_ref', 'masterPage');
                pageData.removePageData(mockPrivateServices, pageDataPointer);
                var innerData = mockPrivateServices.dal.get(innerDataPointer);
                var bgRefData = mockPrivateServices.dal.get(bgRefDataPointer);
                expect(bgRefData).toBeUndefined();
                expect(innerData).toBeUndefined();
            });
        });

        describe('setPageData', function () {
            function setPageData(ps, pageId, pageUriSEO) {
                pageData.setPageData(ps, pageId, {
                    id: pageId,
                    pageUriSEO: pageUriSEO,
                    type: 'Page'
                });
            }

            it('should rename pageUriSEO if urlFormat is hashBang', function () {
                mockPrivateServices = getPrivateServices(['page-one', 'page-two'], 'hashBang');

                setPageData(mockPrivateServices, 'page-one-id', 'page-two');

                expect(pageData.getPageData(mockPrivateServices, 'page-one-id').pageUriSEO).toBe('page-two');
            });

            it('should do nothing if pageUriSEO stays the same', function () {
                mockPrivateServices = getPrivateServices(['page-one', 'page-two']);

                setPageData(mockPrivateServices, 'page-one-id', 'page-one');

                expect(pageData.getPageData(mockPrivateServices, 'page-one-id').pageUriSEO).toBe('page-one');
            });

            it('should do nothing if pageUriSEO stays the same and it is a forbidden word', function () {
                mockPrivateServices = getPrivateServices(['page-one', 'page-two'], null, 'page-one');

                setPageData(mockPrivateServices, 'page-one-id', 'page-one');

                expect(pageData.getPageData(mockPrivateServices, 'page-one-id').pageUriSEO).toBe('page-one');
            });

            it('should rename pageUriSEO if valid', function () {
                mockPrivateServices = getPrivateServices(['page-one', 'page-two']);

                setPageData(mockPrivateServices, 'page-one-id', 'page-three');

                expect(pageData.getPageData(mockPrivateServices, 'page-one-id').pageUriSEO).toBe('page-three');
            });

            it('should throw error if pageUriSEO already exists in another page', function () {
                mockPrivateServices = getPrivateServices(['page-one', 'page-two']);

                expect(function () {
                    setPageData(mockPrivateServices, 'page-one-id', 'page-two');
                }).toThrow(new Error('pageUriSEO is invalid: not unique across site'));
            });

            it('should throw error if pageUriSEO is a reserved word', function () {
                mockPrivateServices = getPrivateServices(['page']);

                expect(function () {
                    setPageData(mockPrivateServices, 'page-id', 'reserved-word');
                }).toThrow(new Error('pageUriSEO is invalid: reserved word'));
            });

            it('should throw error if pageUriSEO is longer than MAX_LENGTH chars', function () {
                mockPrivateServices = getPrivateServices(['page']);
                expect(function () {
                    setPageData(mockPrivateServices, 'page-id', _.repeat('a', constants.URLS.MAX_LENGTH + 1));
                }).toThrow(new Error('pageUriSEO is invalid: over ' + constants.URLS.MAX_LENGTH + ' chars'));
            });

            it('should throw error if pageUriSEO has uppercase characters', function () {
                mockPrivateServices = getPrivateServices(['page']);
                expect(function () {
                    setPageData(mockPrivateServices, 'page-id', 'AAAAA');
                }).toThrow(new Error('pageUriSEO is invalid: all letters must be lowercase'));
            });

            it('should throw error if pageUriSEO has illegal characters', function () {
                mockPrivateServices = getPrivateServices(['page']);
                expect(function () {
                    setPageData(mockPrivateServices, 'page-id', '@');
                }).toThrow(new Error('pageUriSEO is invalid: must only be alphanumeric or hyphen'));
            });

            it('should use the title to create a pageUriSEO if it is an empty string', function(){
                mockPrivateServices = getPrivateServices(['page-one']);

                pageData.setPageData(mockPrivateServices, 'page-one-id', {
                    id: 'page-one-id',
                    pageUriSEO: '',
                    title: 'page1-title',
                    type: 'Page'
                });

                expect(pageData.getPageData(mockPrivateServices, 'page-one-id').pageUriSEO).toBe('page1-title');
            });

            it('should leave the pageUriSEO the same as it was if it is missing', function(){
                mockPrivateServices = getPrivateServices(['page-one']);
                var EXPECTED_PAGE_URI_SEO = 'page1-title';

                pageData.setPageData(mockPrivateServices, 'page-one-id', {
                    id: 'page-one-id',
                    pageUriSEO: '',
                    title: EXPECTED_PAGE_URI_SEO,
                    type: 'Page'
                });

                pageData.setPageData(mockPrivateServices, 'page-one-id', {
                    id: 'page-one-id',
                    title: 'page2-title',
                    type: 'Page'
                });

                expect(pageData.getPageData(mockPrivateServices, 'page-one-id').pageUriSEO).toBe(EXPECTED_PAGE_URI_SEO);
            });
        });

        describe('getValidPageUriSEO', function () {
            it('should return the same value for a valid name', function () {
                createMockPrivateServicesWithPages(['page1']);
                expect(pageData.getValidPageUriSEO(mockPrivateServices, 'page1', 'blank')).toBe('blank');
            });

            it('should return a valid pageUriSEO for a page name', function () {
                createMockPrivateServicesWithPages(['page1']);
                expect(pageData.getValidPageUriSEO(mockPrivateServices, 'page1', 'Some Page')).toBe('some-page');
            });

            it('should not allow invalid names', function () {
                createMockPrivateServicesWithPages(['page1']);
                mockPrivateServices.dal.set(mockPrivateServices.pointers.general.getForbiddenPageUriSEOs(), {forbidden: true});
                expect(pageData.getValidPageUriSEO(mockPrivateServices, 'page1', 'forbidden')).toBe('forbidden-1');
            });

            it("should return a pageUriSEO which is <= 40 chars", function(){
                createMockPrivateServicesWithPages(['page1']);
                var validPageUriSEO = pageData.getValidPageUriSEO(mockPrivateServices, 'page1', 'Some Page with 40 characters or more because I am cool like that');
                expect(validPageUriSEO.length).toBeLessThan(41);
            });


            it("should return a pageUriSEO which is <= 40 chars when there are duplicate urls", function(){
                mockPrivateServices = getPrivateServices(['page1', 'page2']);
                var duplicateLongPageTitle = 'Some Page with 40 characters or more because I am cool like that';
                var validPageUriSEO = pageData.getValidPageUriSEO(mockPrivateServices, 'page1', duplicateLongPageTitle);
                pageData.setPageData(mockPrivateServices, 'page1', {
                    id: 'page1',
                    pageUriSEO: validPageUriSEO,
                    title: duplicateLongPageTitle,
                    type: 'Page'
                });

                var validPageUriSEO2 = pageData.getValidPageUriSEO(mockPrivateServices, 'page2', duplicateLongPageTitle);

                expect(validPageUriSEO2.length).toBeLessThan(41);
            });
        });

        describe('isForbiddenPageUriSeo', function() {

            beforeEach(function() {
                var pageId = 'page1';
                createMockPrivateServicesWithPages([pageId]);
            });

            it('should not consider properties showing on the prototype as forbidden words - SE-18992', function() {
                var isForbidden = pageData.isForbiddenPageUriSeo(mockPrivateServices, 'page1', 'constructor');

                expect(isForbidden).toBeFalsy();
            });
        });
    });
});
