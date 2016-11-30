define([
    'definition!documentServices/page/page',
    'lodash',
    'core',
    'utils',
    'documentServices/hooks/hooks',
    'fake!documentServices/actionsAndBehaviors/actionsAndBehaviors',
    'documentServices/constants/constants',
    'documentServices/component/component',
    'documentServices/componentDetectorAPI/componentDetectorAPI',
    'documentServices/component/componentStylesAndSkinsAPI',
    'documentServices/dataModel/dataModel',
    'documentServices/page/pageUtils',
    'documentServices/page/popupUtils',
    'documentServices/page/pageData',
    'documentServices/page/pageProperties',
    'documentServices/dataModel/DataSchemas.json',
    'documentServices/tpa/constants',
    'documentServices/documentMode/documentModeInfo',
    'documentServices/mobileConversion/mobileActions',
    'documentServices/mobileConversion/mobileConversionFacade',
    'documentServices/siteMetadata/passwordProtected',
    'documentServices/page/blankPageStructure',
    'documentServices/tpa/services/clientSpecMapService',
    'testUtils',
    'experiment',
    'fake!documentServices/aspects/DocumentServicesAspect',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/documentMode/documentMode'
], function
    (pageDefinition,
     _,
     core,
     utils,
     hooks,
     actionsAndBehaviorsFake,
     constants,
     component,
     componentDetectorAPI,
     componentStylesAndSkinsAPI,
     dataModel,
     pageUtils,
     popupUtils,
     pageData,
     pageProperties,
     dataSchemas,
     tpaConstants,
     documentModeInfo,
     mobileActions,
     mobileConversion,
     passwordProtected,
     blankPageStructure,
     clientSpecMapService,
     testUtils,
     experiment,
     DocumentServicesAspectFake,
     privateServicesHelper,
     documentMode) {
    'use strict';


    var page = pageDefinition(
        _,
        core,
        utils,
        hooks,
        actionsAndBehaviorsFake,
        constants,
        component,
        componentDetectorAPI,
        componentStylesAndSkinsAPI,
        dataModel,
        pageUtils,
        popupUtils,
        pageData,
        pageProperties,
        dataSchemas,
        tpaConstants,
        documentModeInfo,
        mobileActions,
        mobileConversion,
        passwordProtected,
        blankPageStructure,
        clientSpecMapService,
        documentMode,
        experiment
    );

    describe('Page Manipulation API', function () {

        var mockPrivateServices;
        var mockAddPageInfo;
        var mockPageId = 'mockPageId';

        var BLANK_PAGE = {
            "componentType": "mobile.core.components.Page",
            "type": "Page",
            "skin": "skins.core.InlineSkin",
            "layout": {
                "anchors": [],
                "x": 0,
                "y": 0,
                "fixedPosition": false,
                "width": 980,
                "height": 500,
                "scale": 1,
                "rotationInDegrees": 0
            },
            "components": [],
            "data": {
                "pageUriSEO": "blank",
                "descriptionSEO": "",
                "underConstruction": false,
                "indexable": true,
                "metaKeywordsSEO": "",
                "pageSecurity": {"requireLogin": false, "passwordDigest": "", "dialogLanguage": ""},
                "metaData": {"isPreset": false, "schemaVersion": 1, "isHidden": false},
                "hidePage": false,
                "mobileHidePage": null,
                "pageTitleSEO": "",
                "hideTitle": true,
                "pageBackgrounds": {
                    "desktop": {},
                    "mobile": {}
                },
                "title": "New Page",
                "icon": "",
                "type": "Page",
                "isLandingPage": false,
                "isPopup": false,
                "translationData": {
                    "uriSEOTranslated": false
                }
            },
            "style": "p2",
            'activeModes': {}
        };

        function createMockPrivateServicesWithPages(pagesId, overidePageData, pageStructure) {
            var pages = _.transform(pagesId, function (result, pageId) {
                var props = {};
                if (pageStructure && pageStructure.props) {
                    props[pageId] = pageStructure.props;
                }
                result[pageId] = {
                    title: pageId + '_title',
                    props: props
                };
            }, {});
            pageStructure = pageStructure || BLANK_PAGE;

            var siteData = privateServicesHelper.getSiteDataWithPages(pages);

            _.forEach(pagesId, function (pageId) {
                var data = _.cloneDeep(pageStructure.data);
                data.id = pageId;
                data.data = 'PAGE_DATA_' + pageId;
                data.pageSecurity.passwordDigest = _.get(overidePageData, 'passwordDigest');
                data.tpaApplicationId = _.get(overidePageData, 'tpaApplicationId') || 0;
                data.tpaPageId = _.get(overidePageData, 'tpaPageId') || '';
                siteData.addData(data, 'masterPage');
                siteData.setCurrentPage(mockPageId);
                if (pageStructure.props) {
                    pageStructure.props.id = pageId;
                    siteData.addProperties(pageStructure.props, 'masterPage');
                }
            });

            mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData, {
                siteData: [
                    {path: ['urlFormatModel'], optional: true},
                    {path: ['mobileDeletedCompsMap'], optional: true}
                ]
            });
            return mockPrivateServices;
        }

        beforeEach(function () {
            spyOn(pageUtils, 'executePageDataChangedCallback').and.returnValue();
            spyOn(hooks, 'executeHook').and.returnValue();
        });

        describe('getPageIdToAdd', function () {

            beforeEach(function () {
                mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL();
            });

            it('should return an pointer to page with generated id', function () {
                spyOn(utils.guidUtils, 'generateNewPageId').and.returnValue(mockPageId);

                var pageRef = page.getPageIdToAdd(mockPrivateServices);

                expect(pageRef.id).toEqual(mockPageId);
            });
        });

        describe('addByStructure', function () {

            beforeEach(function () {
                this.component = {};
                var newPageId = "page1";

                mockAddPageInfo = {
                    "componentType": "mobile.core.components.Page",
                    "type": "Page",
                    "id": newPageId,
                    "styleId": "p1",
                    "skin": "wysiwyg.viewer.skins.page.TransparentPageSkin",
                    "layout": {
                        "x": 0,
                        "y": 0,
                        "fixedPosition": false,
                        "width": 980,
                        "height": 1061,
                        "scale": 1,
                        "rotationInDegrees": 0,
                        "anchors": []
                    },
                    "data": {
                        "type": "Page",
                        "metaData": {"isPreset": false, "schemaVersion": "1.0", "isHidden": false},
                        "title": "Welcome",
                        "hideTitle": true,
                        "icon": "",
                        "descriptionSEO": "",
                        "metaKeywordsSEO": "",
                        "pageTitleSEO": "",
                        "pageUriSEO": "landing-page",
                        "hidePage": false,
                        "underConstruction": false,
                        "tpaApplicationId": 0,
                        "pageSecurity": {"requireLogin": false},
                        "indexable": true,
                        "isLandingPage": true
                    },
                    "dataRefs": {},
                    "dataId": "mainPage",
                    "components": []
                };

                mockPrivateServices = createMockPrivateServicesWithPages(['mainPage']);
                mockPrivateServices.siteAPI.setCurrentPage('mainPage');
            });

            it('should add page', function () {
                var pageCompPointer = page.getPageIdToAdd(mockPrivateServices);

                page.add(mockPrivateServices, pageCompPointer, null, mockAddPageInfo);

                var pageObjectPointer = mockPrivateServices.pointers.page.getPagePointer(pageCompPointer.id);
                var pageObject = mockPrivateServices.dal.get(pageObjectPointer);

                expect(pageObject).toBeDefined();
            });

            it('should NOT add the page data object to the document_data of the page', function () {
                var pagePointer = page.getPageIdToAdd(mockPrivateServices);

                page.add(mockPrivateServices, pagePointer, null, mockAddPageInfo);

                var pageObjectPointer = mockPrivateServices.pointers.page.getPagePointer(pagePointer.id);
                var pageObject = mockPrivateServices.dal.get(pageObjectPointer);

                expect(pageObject.data.document_data).toEqual({});
            });

            it('should add data item also to master page', function () {
                var pagePointer = page.getPageIdToAdd(mockPrivateServices);

                page.add(mockPrivateServices, pagePointer, null, mockAddPageInfo);

                var pageDataItemInMasterPointer = mockPrivateServices.pointers.data.getDataItemFromMaster(pagePointer.id);
                var pageDataItemInMaster = mockPrivateServices.dal.get(pageDataItemInMasterPointer);

                expect(pageDataItemInMaster.id).toEqual(pagePointer.id);
            });

            it('should add blank page if no structure was provided', function () {
                var pagePointer = page.getPageIdToAdd(mockPrivateServices);

                page.add(mockPrivateServices, pagePointer);

                var pageObjectPointer = mockPrivateServices.pointers.page.getPagePointer(pagePointer.id);
                var pageObject = mockPrivateServices.dal.get(pageObjectPointer);

                expect(pageObject.title).toEqual('Blank');
            });

            it('should add a page with custom title and pageUriSEO', function () {
                var newTitle = 'customTitle';
                var pageCompPointer = page.getPageIdToAdd(mockPrivateServices);

                page.add(mockPrivateServices, pageCompPointer, newTitle, mockAddPageInfo);

                var pageObjectPointer = mockPrivateServices.pointers.page.getPagePointer(pageCompPointer.id);
                var pageObject = mockPrivateServices.dal.get(pageObjectPointer);
                expect(pageObject.title).toEqual(newTitle);
            });

            describe('when serializedPage contains mobileComponents', function () {
                var serializedPageToAdd, serializedComp;
                var serializedCompProto = {
                    id: 'compId',
                    style: 'ca1',
                    data: {type: 'Image', id: 'myDesktopData'},
                    layout: {},
                    componentType: 'wysiwyg.viewer.components.ClipArt',
                    props: {type: 'WPhotoProperties', id: 'myDesktopProps'}
                };
                var serializedPageToAddProto = {
                    id: "pageId",
                    componentType: "mobile.core.components.Page",
                    layout: {anchors: []},
                    data: {type: 'Page'},
                    style: 'p1'
                };
                beforeEach(function () {
                    serializedPageToAdd = _.cloneDeep(serializedPageToAddProto);
                    serializedComp = _.cloneDeep(serializedCompProto);
                });

                it('should add a page with its mobile components, and keep the same data, properties and style ids between desktop and mobile components', function () {
                    serializedPageToAdd.components = [serializedComp];
                    serializedPageToAdd.mobileComponents = [serializedComp];
                    var pagePointer = page.getPageIdToAdd(mockPrivateServices);

                    page.add(mockPrivateServices, pagePointer, 'newPage', serializedPageToAdd);

                    var addedPage = mockPrivateServices.dal.get(pagePointer);
                    var addedComponent = addedPage.components[0];
                    var addedMobileComponent = addedPage.mobileComponents[0];

                    expect(addedPage.mobileComponents).toBeDefined();
                    expect(addedComponent.id).toEqual(addedMobileComponent.id);
                    expect(addedComponent.dataQuery).toEqual(addedMobileComponent.dataQuery);
                    expect(addedComponent.propertyQuery).toEqual(addedMobileComponent.propertyQuery);
                    expect(addedComponent.styleId).toEqual(addedMobileComponent.styleId);
                });

                it('should add a page with its mobile components, and keep the mobile and desktop components split in case they are split in the serialized component', function () {
                    serializedPageToAdd.components = [serializedComp];
                    var serializedMobileComp = _.cloneDeep(serializedComp);
                    serializedMobileComp.props.id = 'mobile_myDesktopProps';
                    serializedPageToAdd.mobileComponents = [serializedMobileComp];
                    var pagePointer = page.getPageIdToAdd(mockPrivateServices);

                    page.add(mockPrivateServices, pagePointer, 'myPage', serializedPageToAdd);

                    var addedPage = mockPrivateServices.dal.get(pagePointer);
                    var addedComponent = addedPage.components[0];
                    var addedMobileComponent = addedPage.mobileComponents[0];

                    expect(addedMobileComponent.propertyQuery).toEqual('mobile_' + addedComponent.propertyQuery);
                });
            });


        });

        describe('remove', function () {
            var pageToRemoveId = 'page1';

            beforeEach(function () {
                createMockPrivateServicesWithPages([pageToRemoveId]);
            });

            describe('remove flow', function () {

                function removePage(pageId) {
                    return page.remove.bind(page, mockPrivateServices, pageId, _.noop);
                }

                it('should delete page if no actions were added', function (done) {

                    spyOn(component, 'remove').and.callFake(function (ps, pageStructureAbstract, callback) {
                        callback(ps);
                    });

                    page.remove(mockPrivateServices, pageToRemoveId, function () {

                        var pageComponentPointer = mockPrivateServices.pointers.components.getPage(pageToRemoveId, constants.VIEW_MODES.DESKTOP);
                        expect(component.remove).toHaveBeenCalledWith(mockPrivateServices, pageComponentPointer, jasmine.any(Function));

                        var pageDataItemInMasterPointer = mockPrivateServices.pointers.data.getDataItemFromMaster(pageToRemoveId);
                        var pageDataItemInMaster = mockPrivateServices.dal.get(pageDataItemInMasterPointer);
                        expect(pageDataItemInMaster).not.toBeDefined();


                        var pagePointer = mockPrivateServices.pointers.page.getPagePointer(pageToRemoveId);
                        expect(pagePointer).toBeNull();

                        done();
                    });

                });

                it('should throw error if trying to delete masterPage', function () {
                    spyOn(pageUtils, 'isMasterPage').and.returnValue(true);
                    expect(removePage(mockPageId)).toThrow(new Error('It is not allowed to remove masterPage'));
                });

                it('should throw error if trying to delete a non existing page', function () {
                    spyOn(pageUtils, 'isMasterPage').and.returnValue(false);
                    spyOn(pageData, 'doesPageExist').and.returnValue(false);
                    expect(removePage(mockPageId)).toThrow(new Error('Page with id "mockPageId" does not exist'));
                });

                it('should throw error if trying to delete current page', function () {
                    spyOn(pageUtils, 'isMasterPage').and.returnValue(false);
                    spyOn(pageData, 'doesPageExist').and.returnValue(true);
                    expect(removePage(mockPageId)).toThrow(new Error('It is not allowed to delete current page (mockPageId), please navigate to another page (page.navigateTo) and try again'));
                });

                it('should throw error if trying to delete homePage', function () {
                    spyOn(pageUtils, 'isMasterPage').and.returnValue(false);
                    spyOn(pageData, 'doesPageExist').and.returnValue(true);
                    spyOn(pageUtils, 'isHomepage').and.returnValue(true);
                    expect(removePage(mockPageId)).toThrow(new Error('It is not allowed to delete homePage (mockPageId), please set a new page as homePage (page.setAsHomepage) and try again'));
                });
            });

            it("should not remove page if remove component return an error", function (done) {
                var error = "could not delete page";
                spyOn(component, 'remove').and.callFake(function (ps, pageStructureAbstract, removeCallback) {
                    removeCallback(ps, error);
                });

                page.remove(mockPrivateServices, pageToRemoveId, function () {
                    var pageDataItemInMasterPointer = mockPrivateServices.pointers.data.getDataItemFromMaster(pageToRemoveId);
                    var pageDataItemInMaster = mockPrivateServices.dal.get(pageDataItemInMasterPointer);
                    expect(pageDataItemInMaster).toBeDefined();


                    var pagePointer = mockPrivateServices.pointers.page.getPagePointer(pageToRemoveId);
                    var pageStructureAndData = mockPrivateServices.dal.get(pagePointer);
                    expect(pageStructureAndData).toBeDefined();

                    done();
                });

            });

        });

        describe('duplicate', function () {
            var pageIdToDuplicate = 'page1';
            beforeEach(function () {
                this.component = {};

                createMockPrivateServicesWithPages([pageIdToDuplicate]);
                this.ps = mockPrivateServices;
            });

            it('should duplicate a page to new pageId', function () {
                var newPagePointer = page.getPageIdToAdd(this.ps);
                spyOn(mobileConversion, 'convertMobileStructure').and.returnValue();

                page.duplicate(this.ps, newPagePointer, pageIdToDuplicate);

                var pointerToNewPage = this.ps.pointers.page.getPagePointer(newPagePointer.id);
                var newPage = this.ps.dal.get(pointerToNewPage);

                expect(newPage.title).toEqual(pageIdToDuplicate + '_title');
                expect(newPage.structure.id).not.toEqual(pageIdToDuplicate);
            });

            describe('when page has components', function () {
                beforeEach(function () {
                    this.existingPageId = 'somePage';
                    var container = testUtils.mockFactory.createCompStructure('mobile.core.components.Container', {}, {}, 'myContainer');
                    var child = testUtils.mockFactory.createCompStructure('mobile.core.components.Container', {}, {}, 'child');
                    container.compStructure.skin = 's1';
                    child.compStructure.skin = 's1';
                    var anchor = testUtils.mockFactory.createAnchor('child', 'myContainer', 'BOTTOM_PARENT', 50, false, 200);
                    child.compStructure.layout.anchors = [anchor];
                    container.compStructure.components = [child.compStructure];
                    var pagesData = {};
                    pagesData[this.existingPageId] = {
                        title: 'someTitle',
                        components: [container.compStructure]
                    };
                    var siteData = privateServicesHelper.getSiteDataWithPages(pagesData);
                    var existingPageData = _.assign({}, BLANK_PAGE.data, {
                        id: this.existingPageId,
                        data: 'PAGE_DATA_' + this.existingPageId
                    });
                    siteData.addData(existingPageData, 'masterPage');
                    this.ps = mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData, {
                        siteData: [
                            {path: ['urlFormatModel'], optional: true},
                            {path: ['mobileDeletedCompsMap'], optional: true}
                        ]
                    });
                    spyOn(mobileConversion, 'convertMobileStructure').and.returnValue();
                });

                it('should update components ids', function () {
                    this.newPagePointer = page.getPageIdToAdd(this.ps);

                    page.duplicate(this.ps, this.newPagePointer, this.existingPageId);

                    var pointerToNewPage = this.ps.pointers.page.getPagePointer(this.newPagePointer.id);
                    var newPage = this.ps.dal.get(pointerToNewPage);
                    var duplicatedContainer = newPage.structure.components[0];
                    var duplicatedChild = duplicatedContainer.components[0];

                    expect(duplicatedContainer.id).not.toEqual('myContainer');
                    expect(duplicatedChild.id).not.toEqual('child');
                });

                it('should update ids of target components in anchors', function () {
                    this.newPagePointer = page.getPageIdToAdd(this.ps);

                    page.duplicate(this.ps, this.newPagePointer, this.existingPageId);

                    var pointerToNewPage = this.ps.pointers.page.getPagePointer(this.newPagePointer.id);
                    var newPage = this.ps.dal.get(pointerToNewPage);
                    var duplicatedContainer = newPage.structure.components[0];
                    var duplicatedChild = duplicatedContainer.components[0];

                    expect(duplicatedChild.layout.anchors[0]).toBeTruthy();
                    expect(duplicatedChild.layout.anchors[0].targetComponent).not.toEqual('myContainer');
                    expect(duplicatedChild.layout.anchors[0].targetComponent).toEqual(duplicatedContainer.id);
                });
            });


            it('should throw error if trying to duplicate masterPage', function () {
                spyOn(pageUtils, 'isMasterPage').and.returnValue(true);

                expect(function duplicateMasterPage() {
                    var newPagePointer = page.getPageIdToAdd(mockPrivateServices);
                    page.duplicate(mockPrivateServices, newPagePointer, pageIdToDuplicate);
                }).toThrow(new Error('It is not allowed to duplicate masterPage'));
            });

            it('should throw error if trying to duplicate a non existing page', function () {
                spyOn(pageData, 'doesPageExist').and.returnValue(false);

                expect(function duplicateNotExistPage() {
                    var newPagePointer = page.getPageIdToAdd(mockPrivateServices);
                    page.duplicate(mockPrivateServices, newPagePointer, pageIdToDuplicate);
                }).toThrow(new Error('Page with id "' + pageIdToDuplicate + '" does not exist'));
            });

            it('should throw error if trying to duplicate TPA section page', function () {
                spyOn(component, 'isContainsCompWithType').and.returnValue(true);

                expect(function duplicateNotExistPage() {
                    var newPagePointer = page.getPageIdToAdd(mockPrivateServices);
                    page.duplicate(mockPrivateServices, newPagePointer, pageIdToDuplicate);
                }).toThrow(new Error('It is not allowed to duplicate TPA pages'));

            });

        });

        describe('navigateTo', function () {

            beforeEach(function () {
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(mockPageId)
                    .setCurrentPage(mockPageId);
                mockPrivateServices = privateServicesHelper.mockPrivateServices(siteData);
                this.siteData = siteData;
            });

            it('navigateToPage of siteAPI is called', function () {
                var navigateSpy = spyOn(mockPrivateServices.siteAPI, 'navigateToPage');

                page.navigateTo(mockPrivateServices, 'pageId');

                expect(navigateSpy).toHaveBeenCalledWith({pageId: 'pageId'});
            });

            it('navigating to the current page', function () {
                spyOn(mockPrivateServices.siteAPI, 'navigateToPage').and.callThrough();

                var spyCallback = jasmine.createSpy('pageChangedCallback');
                page.navigateTo(mockPrivateServices, mockPageId, spyCallback);

                expect(spyCallback).toHaveBeenCalled();
                expect(mockPrivateServices.siteAPI.navigateToPage).not.toHaveBeenCalled();
            });

            it('callback is called', function (done) {
                var navigateSpy = spyOn(mockPrivateServices.siteAPI, 'navigateToPage');

                var original = mockPrivateServices.setOperationsQueue.waitForChangesApplied.bind(mockPrivateServices.setOperationsQueue);
                spyOn(mockPrivateServices.setOperationsQueue, 'waitForChangesApplied').and.callFake(function () {
                    _.defer(original, arguments[0]);
                });

                var spyCallback = jasmine.createSpy('pageChangedCallback').and.callFake(function () {
                    expect(navigateSpy).toHaveBeenCalledWith({pageId: 'pageId'});
                    done();
                });
                page.navigateTo(mockPrivateServices, 'pageId', spyCallback);
            });
        });

        describe('navigateToPageAndScrollToAnchor', function () {

            beforeEach(function () {
                mockPrivateServices = privateServicesHelper.mockPrivateServices();
                spyOn(mockPrivateServices.siteAPI, 'scrollToAnchor');
                var callbacks = [];
                spyOn(mockPrivateServices.siteAPI, 'registerNavigationComplete').and.callFake(function (callback) {
                    callbacks.push(callback);
                });

                spyOn(mockPrivateServices.siteAPI, 'navigateToPage').and.callFake(function () {
                    _.forEach(callbacks, function (cb) {
                        cb();
                    });
                });
            });

            it('should scroll immediately if anchor is SCROLL_TO_BOTTOM or SCROLL_TO_TOP', function () {
                var callback = _.noop;
                page.navigateToPageAndScrollToAnchor(mockPrivateServices, 'pageId', 'SCROLL_TO_BOTTOM', callback);

                expect(mockPrivateServices.siteAPI.navigateToPage).not.toHaveBeenCalled();
                expect(mockPrivateServices.siteAPI.scrollToAnchor).toHaveBeenCalledWith('SCROLL_TO_BOTTOM', callback);
            });

            it('should navigate to page and then scroll if anchor is not SCROLL_TO_BOTTOM or SCROLL_TO_TOP', function () {
                var callback = _.noop;
                page.navigateToPageAndScrollToAnchor(mockPrivateServices, 'pageId', 'anchorId', callback);

                expect(mockPrivateServices.siteAPI.navigateToPage).toHaveBeenCalledWith({pageId: 'pageId'});
                expect(mockPrivateServices.siteAPI.scrollToAnchor).toHaveBeenCalledWith('anchorId', callback);
            });

        });

        describe('setHomepage', function () {

            it('should set home page id', function () {
                var pageId = 'page1';
                createMockPrivateServicesWithPages([pageId]);
                page.homePage.set(mockPrivateServices, pageId);

                var siteStructureDataPointer = mockPrivateServices.pointers.data.getDataItemFromMaster('masterPage');
                var homePagePointer = mockPrivateServices.pointers.getInnerPointer(siteStructureDataPointer, 'mainPage');
                var homePageIdPointer = mockPrivateServices.pointers.getInnerPointer(siteStructureDataPointer, 'mainPageId');

                expect(mockPrivateServices.dal.get(homePageIdPointer)).toBe(pageId);
                expect(mockPrivateServices.dal.get(homePagePointer)).toBe('#' + pageId);
            });
        });

        describe('getPageData', function () {

            it('should get data item', function () {
                var pageId = 'page1';
                createMockPrivateServicesWithPages([pageId]);

                var pageDataItem = page.data.get(mockPrivateServices, pageId);

                var pageDataItemPointer = mockPrivateServices.pointers.data.getDataItemFromMaster(pageId);
                var expectedPageDataItem = mockPrivateServices.dal.get(pageDataItemPointer);
                expect(pageDataItem.id).toEqual(expectedPageDataItem.id);
                expect(pageDataItem.data).toEqual(expectedPageDataItem.data);
            });

        });

        describe('getPageLayout', function () {

            it('Should return the page layout of a given pageId', function () {
                var pageId = 'page1';
                createMockPrivateServicesWithPages([pageId]);
                var expectedLayout = {x: 0, y: 0};
                spyOn(component.layout, 'get').and.returnValue(expectedLayout);

                var pageLayout = page.getLayout(mockPrivateServices, pageId);

                expect(pageLayout).toEqual(expectedLayout);
            });
        });

        describe('serializePage', function () {
            var pageToDuplicate = 'page1';
            beforeEach(function () {
                this.component = {};

                createMockPrivateServicesWithPages([pageToDuplicate]);
            });

            it('should return serialized page', function () {
                var newPageTitle = 'mockTitle';
                var pageRef = page.getPageIdToAdd(mockPrivateServices);
                var expectedResult = _.cloneDeep(BLANK_PAGE);
                expectedResult.data.title = newPageTitle;
                page.add(mockPrivateServices, pageRef, newPageTitle, BLANK_PAGE);

                var serializePage = page.serializePage(mockPrivateServices, pageRef.id);

                expect(serializePage).toEqual(expectedResult);
            });

            it('should return serialized page with ids if maintainMobileStructure arg is true', function () {
                var newPageTitle = 'mockTitle';
                var pageRef = page.getPageIdToAdd(mockPrivateServices);
                var expectedResult = _.cloneDeep(BLANK_PAGE);
                expectedResult.data.title = newPageTitle;
                expectedResult.id = pageRef.id;
                delete expectedResult.data.id;
                page.add(mockPrivateServices, pageRef, newPageTitle, BLANK_PAGE);

                var serializePage = page.serializePage(mockPrivateServices, pageRef.id, true);

                expect(serializePage.id).toBeDefined();
                expect(serializePage).toEqual(expectedResult);
            });

        });

        describe('initialize', function () {
            it('should do nothing when none of the pages have passwordDigest value', function () {
                var pageId = 'page1';
                createMockPrivateServicesWithPages([pageId]);
                var pageDataItem = page.data.get(mockPrivateServices, pageId);

                page.initialize(mockPrivateServices);
                var pageDataItemPointer = mockPrivateServices.pointers.data.getDataItemFromMaster(pageId);
                var expectedPageDataItem = mockPrivateServices.dal.get(pageDataItemPointer);
                expect(pageDataItem.id).toEqual(expectedPageDataItem.id);
                expect(pageDataItem.data).toEqual(expectedPageDataItem.data);
            });

            it('should delete pageSecurity.passwordDigest for pages w/ passwordDigest value & preserve dialogLanguage', function () {
                var pageId = 'page1';
                createMockPrivateServicesWithPages([pageId], {
                    passwordDigest: 'password'
                });
                var pageDataItem = page.data.get(mockPrivateServices, pageId);

                page.initialize(mockPrivateServices);

                var pageDataItemAfterChange = page.data.get(mockPrivateServices, pageId);

                expect(pageDataItemAfterChange.id).toEqual(pageDataItem.id);
                expect(pageDataItemAfterChange.pageSecurity.passwordDigest).not.toBeDefined();
                expect(pageDataItemAfterChange.pageSecurity.dialogLanguage).toEqual(pageDataItem.pageSecurity.dialogLanguage);
            });

            describe('tpa hidden pages with csm indexable false and page data indexable true', function () {
                it('should change page data indexable to false when the page app data is indexable false', function () {
                    var pageId = 'page1';
                    createMockPrivateServicesWithPages([pageId], {
                        tpaApplicationId: 1, tpaPageId: 'pageId'
                    });
                    var pageDataItem = page.data.get(mockPrivateServices, pageId);
                    spyOn(clientSpecMapService, 'getAppData').and.returnValue({
                        appDefinitionId: 'appDefinitionId'
                    });
                    spyOn(clientSpecMapService, 'getWidgetDataFromTPAPageId').and.returnValue({
                        appPage: {
                            indexable: false
                        }
                    });

                    page.initialize(mockPrivateServices);

                    var pageDataItemAfterChange = page.data.get(mockPrivateServices, pageId);

                    expect(pageDataItem.indexable).toBeTruthy();
                    expect(pageDataItemAfterChange.indexable).toBeFalsy();
                });

                it('should change page data indexable from false to true', function () {
                    var pageId = 'page1';
                    createMockPrivateServicesWithPages([pageId], {
                        tpaApplicationId: 1, tpaPageId: 'pageId'
                    });
                    page.data.set(mockPrivateServices, pageId, {
                        'indexable': false
                    });
                    var pageDataItem = page.data.get(mockPrivateServices, pageId);
                    spyOn(clientSpecMapService, 'getAppData').and.returnValue({
                        appDefinitionId: 'appDefinitionId'
                    });
                    spyOn(clientSpecMapService, 'getWidgetDataFromTPAPageId').and.returnValue({
                        appPage: {
                            indexable: true
                        }
                    });

                    page.initialize(mockPrivateServices);

                    var pageDataItemAfterChange = page.data.get(mockPrivateServices, pageId);

                    expect(pageDataItem.indexable).toBeFalsy();
                    expect(pageDataItemAfterChange.indexable).toBeTruthy();
                });

                it('should not change page data indexable if it is equal to the one exists in the page data', function () {
                    var pageId = 'page1';
                    createMockPrivateServicesWithPages([pageId], {
                        tpaApplicationId: 1, tpaPageId: 'pageId'
                    });
                    page.data.set(mockPrivateServices, pageId, {
                        'indexable': false
                    });
                    var pageDataItem = page.data.get(mockPrivateServices, pageId);
                    spyOn(clientSpecMapService, 'getAppData').and.returnValue({
                        appDefinitionId: 'appDefinitionId'
                    });
                    spyOn(clientSpecMapService, 'getWidgetDataFromTPAPageId').and.returnValue({
                        appPage: {
                            indexable: false
                        }
                    });

                    page.initialize(mockPrivateServices);

                    var pageDataItemAfterChange = page.data.get(mockPrivateServices, pageId);

                    expect(pageDataItem.indexable).toBeFalsy();
                    expect(pageDataItemAfterChange.indexable).toBeFalsy();
                });

                it('should not change page data indexable when the page app data has no indexable data', function () {
                    var pageId = 'page1';
                    createMockPrivateServicesWithPages([pageId], {
                        tpaApplicationId: 1, tpaPageId: 'pageId'
                    });
                    var pageDataItem = page.data.get(mockPrivateServices, pageId);
                    spyOn(clientSpecMapService, 'getAppData').and.returnValue({
                        appDefinitionId: 'appDefinitionId'
                    });
                    spyOn(clientSpecMapService, 'getWidgetDataFromTPAPageId').and.returnValue({
                        appPage: {}
                    });

                    page.initialize(mockPrivateServices);

                    var pageDataItemAfterChange = page.data.get(mockPrivateServices, pageId);

                    expect(pageDataItem.indexable).toBeTruthy();
                    expect(pageDataItemAfterChange.indexable).toBeTruthy();
                });
            });
        });

        describe('permissions password', function () {
            var pageId, password;
            beforeEach(function () {
                pageId = 'pageId';
                password = 'password';
                spyOn(passwordProtected, 'setPagePassword');
                spyOn(passwordProtected, 'isPageProtected');
                spyOn(passwordProtected, 'setPageToNoRestriction');
            });

            it('should set the given password object when calling update', function () {
                page.permissions.updatePassword(mockPrivateServices, pageId, {
                    value: password
                });
                expect(passwordProtected.setPagePassword).toHaveBeenCalledWith(mockPrivateServices, pageId, {
                    value: password
                });
            });

            it('should create a password object when calling update w/ a string', function () {
                page.permissions.updatePassword(mockPrivateServices, pageId, password);
                expect(passwordProtected.setPagePassword).toHaveBeenCalledWith(mockPrivateServices, pageId, {
                    value: password, isHashed: false
                });
            });

            it('should set password to null when calling remove', function () {
                page.permissions.removePassword(mockPrivateServices, pageId);
                expect(passwordProtected.setPageToNoRestriction).toHaveBeenCalledWith(mockPrivateServices, pageId);
            });

            it('should check if has password when calling has', function () {
                passwordProtected.isPageProtected.and.returnValue(true);
                var pageProtected = page.permissions.hasPassword(mockPrivateServices, pageId);
                expect(passwordProtected.isPageProtected).toHaveBeenCalledWith(mockPrivateServices, pageId);
                expect(pageProtected).toBeTruthy();


                passwordProtected.isPageProtected.and.returnValue(false);
                pageProtected = page.permissions.hasPassword(mockPrivateServices, pageId);
                expect(pageProtected).toBeFalsy();
            });
        });


        describe('popupPagesAPI - ', function () {
            beforeEach(function () {
                this.psMock = {
                    siteAPI: {
                        openPopupPage: jasmine.createSpy('openPopupPage'),
                        closePopupPage: jasmine.createSpy('closePopupPage'),
                        getCurrentPopupId: jasmine.createSpy('getCurrentPopupId'),
                        isPopupOpened: jasmine.createSpy('isPopupOpened'),
                        navigateToPage: jasmine.createSpy('navigateToPage')
                    }
                };
            });

            describe('addByStructure', function () {
                var popupStructure;
                var currentPageId = 'currentPageId';

                beforeEach(function () {
                    this.component = {};

                    mockPrivateServices = createMockPrivateServicesWithPages(['mainPage', currentPageId]);

                    spyOn(actionsAndBehaviorsFake, 'setComponentBehavior');

                    popupStructure = _.cloneDeep(BLANK_PAGE);
                    popupStructure.data.isPopup = true;
                    popupStructure.props = {
                        type: "PageProperties",
                        "desktop": {
                            "popup": {
                                "closeOnOverlayClick": false
                            }
                        },
                        "mobile": {
                            "popup": {
                                "closeOnOverlayClick": true
                            }
                        }
                    };
                    popupStructure.components = [
                        {
                            'type': 'Container',
                            'components': [],
                            'skin': 'wysiwyg.viewer.skins.area.RectangleArea',
                            'layout': {
                                'width': 100,
                                'height': 100,
                                'x': 0,
                                'y': 10,
                                'scale': 1,
                                'rotationInDegrees': 0,
                                'anchors': [],

                                fixedPosition: false,

                                docked: {
                                    hCenter: {px: 0},
                                    vCenter: {px: 0}
                                }
                            },
                            'componentType': 'wysiwyg.viewer.components.PopupContainer',
                            props: {
                                type: 'PopupContainerProperties'
                            }
                        }
                    ];
                });

                it('should throw when no PopupContainer in the structure', function () {
                    var pageCompPointer = page.getPageIdToAdd(mockPrivateServices);
                    var withoutPopupContainer = _.cloneDeep(popupStructure);
                    withoutPopupContainer.components = [];

                    expect(function () {
                        page.popupPages.add(mockPrivateServices, pageCompPointer, null, withoutPopupContainer);
                    }).toThrow(new Error("Can't create a popup page. Main container inside the popup was not found"));
                });

                xit('should throw when no props have mistake in schema', function () { // TODO: implemented props validation
                    var pageCompPointer = page.getPageIdToAdd(mockPrivateServices);
                    var malformedProps = _.cloneDeep(popupStructure);
                    malformedProps.props = {
                        type: "PageProperties",
                        "desktop": {
                            "closeOnOverlayClick": false
                        },
                        "mobile": {
                            "closeOnOverlayClick": true
                        }
                    };

                    expect(function () {
                        page.popupPages.add(mockPrivateServices, pageCompPointer, null, malformedProps);
                    }).toThrow(new Error("Can't create a popup page. Main container inside the popup was not found"));
                });

                it('should add popup page', function () {
                    var pageCompPointer = page.getPageIdToAdd(mockPrivateServices);

                    page.popupPages.add(mockPrivateServices, pageCompPointer, null, popupStructure);

                    var pageObjectPointer = mockPrivateServices.pointers.page.getPagePointer(pageCompPointer.id);
                    var pageObject = mockPrivateServices.dal.get(pageObjectPointer);

                    expect(pageObject).toBeDefined();
                });

                it('should add popup page with data and props', function () {
                    var pageCompPointer = page.getPageIdToAdd(mockPrivateServices);
                    var pageId = pageCompPointer.id;

                    page.popupPages.add(mockPrivateServices, pageCompPointer, null, popupStructure);

                    var propsMobile = page.properties.get(mockPrivateServices, {type: constants.VIEW_MODES.MOBILE, id: pageId});
                    var propsDesktop = page.properties.get(mockPrivateServices, {type: constants.VIEW_MODES.DESKTOP, id: pageId});
                    var data = page.data.get(mockPrivateServices, pageId);

                    expect(propsMobile).toEqual(popupStructure.props.mobile);
                    expect(propsDesktop).toEqual(popupStructure.props.desktop);
                    expect(data.isPopup).toEqual(popupStructure.data.isPopup);
                });
            });

            describe('close:', function () {
                it('should call navigateTo with root id', function () {
                    var root = {
                        pageId: 'any'
                    };
                    this.psMock.siteAPI.getRootNavigationInfo = jasmine.createSpy('openPopupPage').and.returnValue(root);
                    spyOn(page, 'navigateTo');

                    page.popupPages.close(this.psMock);

                    expect(page.navigateTo).toHaveBeenCalledWith(this.psMock, 'any', undefined);
                });
            });

            describe('getCurrentPopupId:', function () {
                beforeEach(function () {
                    var currentPopupId;

                    this.run = function (sets) {
                        this.psMock.siteAPI.getCurrentPopupId.and.returnValue(sets.popupId);

                        return this;
                    };

                    this.expect = function (popupId) {
                        currentPopupId = popupId;

                        return this;
                    };

                    this.toBe = function (expectedPopupId) {
                        expect(currentPopupId).toBe(expectedPopupId);
                    };
                });

                it('should get current popup id from siteAPI and return it', function () {
                    this
                        .run({popupId: 'testId'})
                        .expect(page.popupPages.getCurrentPopupId(this.psMock))
                        .toBe('testId');

                    this
                        .run({popupId: 'otherId'})
                        .expect(page.popupPages.getCurrentPopupId(this.psMock))
                        .toBe('otherId');
                });
            });

            describe('isPopupOpened:', function () {
                it('should return "true" if popup is opened', function () {
                    this.psMock.siteAPI.isPopupOpened.and.returnValue(true);

                    expect(page.popupPages.isPopupOpened(this.psMock)).toBe(true);
                });

                it('should return "false" if popup is NOT opened', function () {
                    this.psMock.siteAPI.isPopupOpened.and.returnValue(false);

                    expect(page.popupPages.isPopupOpened(this.psMock)).toBe(false);
                });
            });

            describe('data.set', function () {

                it('should update isPopup', function () {
                    var pageId = 'page1';
                    createMockPrivateServicesWithPages([pageId]);
                    var popupValue = {isPopup: true};

                    page.data.set(mockPrivateServices, pageId, popupValue);
                    var pageDataItem = page.data.get(mockPrivateServices, pageId);

                    expect(pageDataItem.isPopup).toEqual(popupValue.isPopup);
                });

                it('should be able to set isPopup = false', function () {
                    var pageId = 'page1';
                    createMockPrivateServicesWithPages([pageId]);
                    var popupValue = {isPopup: false};

                    page.data.set(mockPrivateServices, pageId, popupValue);
                    var pageDataItem = page.data.get(mockPrivateServices, pageId);

                    expect(pageDataItem.isPopup).toEqual(popupValue.isPopup);
                });

            });
        });

        describe('minHeight:', function () {
            it('Should create page minHeight if none', function () {
                var pagePointer = {
                    id: 'page1',
                    type: constants.VIEW_MODES.DESKTOP
                };

                var pageStructure = _.cloneDeep(BLANK_PAGE);

                createMockPrivateServicesWithPages([pagePointer.id], null, pageStructure);

                page.properties.update(mockPrivateServices, pagePointer, {minHeight: 100});
                var props = page.properties.get(mockPrivateServices, pagePointer);

                expect(props.minHeight).toEqual(100);
            });

            it('Should update page minHeight if has existing', function () {
                var props;
                var pagePointer = {
                    id: 'page1',
                    type: constants.VIEW_MODES.DESKTOP
                };

                var pageStructure = _.cloneDeep(BLANK_PAGE);
                createMockPrivateServicesWithPages([pagePointer.id], null, pageStructure);

                page.properties.update(mockPrivateServices, pagePointer, {minHeight: 123});
                props = page.properties.get(mockPrivateServices, pagePointer);
                expect(props.minHeight).toEqual(123);

                page.properties.update(mockPrivateServices, pagePointer, {minHeight: 100});
                props = page.properties.get(mockPrivateServices, pagePointer);
                expect(props.minHeight).toEqual(100);
            });

            it('Should be able to create different properties for same page in mobile and desktop', function () {
                var pageId = 'page1';
                var desktopPagePointer = {
                    id: pageId,
                    type: constants.VIEW_MODES.DESKTOP
                };

                var mobilePagePointer = {
                    id: pageId,
                    type: constants.VIEW_MODES.MOBILE
                };

                var pageStructure = _.cloneDeep(BLANK_PAGE);
                createMockPrivateServicesWithPages([pageId], null, pageStructure);

                page.properties.update(mockPrivateServices, desktopPagePointer, {minHeight: 111});
                page.properties.update(mockPrivateServices, mobilePagePointer, {minHeight: 999});

                var desktopProps = page.properties.get(mockPrivateServices, desktopPagePointer);
                var mobileProps = page.properties.get(mockPrivateServices, mobilePagePointer);

                expect(desktopProps.minHeight).toEqual(111);
                expect(mobileProps.minHeight).toEqual(999);
            });
        });
    });
});
