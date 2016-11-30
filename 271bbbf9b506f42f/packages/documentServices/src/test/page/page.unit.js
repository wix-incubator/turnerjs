define([
    'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'testUtils/util/mockDefaultJsons',

    'definition!documentServices/page/page',

    'lodash',
    'core',
    'utils',
    'documentServices/hooks/hooks',
    'documentServices/actionsAndBehaviors/actionsAndBehaviors',
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
    'documentServices/documentMode/documentMode',
    'experiment'
], function (
    testUtils,
    privateServicesHelper,
    mockDefaultJsons,

    pageDef,

    _,
    core,
    utils,
    hooks,
    actionsAndBehaviors,
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
) {
    'use strict';

    var siteData, ps, page;

    function getCompPointer(compId, pageId) {
        var pagePointer = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
        return ps.pointers.components.getComponent(compId, pagePointer);
    }

    function runSync(cb) {
        if (cb) {
            cb();
        }
    }

    function generatePage() {
        return pageDef(_,
            core,
            utils,
            hooks,
            actionsAndBehaviors,
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
            experiment);
    }

    describe('Page', function() {

        beforeEach(function() {
            siteData = testUtils.mockFactory.mockSiteData();
            ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

            page = generatePage();
        });

        describe('popupPages', function() {
            var popupContainer = {
                    id: 'popupContainer',
                    componentType: 'wysiwyg.viewer.components.PopupContainer',
                    skin: 'wysiwyg.viewer.skins.stripContainer.DefaultStripContainer',
                    props: {
                        type: 'PopupContainerProperties'
                    }
                },
                popupId = 'popupId',
                navigationCallback;

            beforeEach(function() {
                navigationCallback = jasmine.createSpy('navigationCallback');
            });

            describe('open', function() {
                it('should should navigate to specified page', function() {
                    spyOn(ps.siteAPI, 'navigateToPage');
                    spyOn(ps.siteAPI, 'registerNavigationComplete').and.callFake(runSync);

                    page.popupPages.open(ps, popupId, navigationCallback);

                    expect(ps.siteAPI.navigateToPage).toHaveBeenCalledWith({pageId: popupId});
                    expect(navigationCallback).toHaveBeenCalled();
                });
            });

            describe('close', function() {
                beforeEach(function() {
                    spyOn(page, 'navigateTo');
                });

                it('should should navigate to current page', function() {
                    page.popupPages.close(ps, navigationCallback);

                    expect(page.navigateTo).toHaveBeenCalledWith(ps, 'currentPage', navigationCallback);
                });



            });

            describe('getCurrentPopupId', function() {
                beforeEach(function() {
                    siteData._currentPageIds.popupPage = popupId;
                });

                it('should return result of ps.siteAPI.getCurrentPopupId', function() {
                    expect(page.popupPages.getCurrentPopupId(ps)).toEqual(popupId);
                });
            });

            describe('getCurrentMainContainer', function() {
                beforeEach(function() {
                    siteData.addPopupPageWithDefaults(popupId, [popupContainer]);
                    siteData._currentPageIds.popupPage = popupId;
                });

                it('should return result of ps.siteAPI.getCurrentPopupId', function() {
                    expect(page.popupPages.getCurrentMainContainer(ps, constants.VIEW_MODES.DESKTOP))
                        .toEqual(getCompPointer(popupContainer.id, popupId));
                });
            });

            describe('getPopupIdToAdd', function() {
                it('should get new page pointer', function() {
                    page = generatePage();
                    spyOn(ps.pointers.components, 'getNewPage');

                    page.popupPages.getPopupIdToAdd(ps);

                    expect(ps.pointers.components.getNewPage).toHaveBeenCalled();
                });
            });

            describe('getDataList', function() {
                it('should return list of popup\'s data', function() {
                    var dataList;
                    siteData.addPopupPageWithDefaults(popupId, [popupContainer]);
                    siteData.addPopupPageWithDefaults(popupId + '2', [popupContainer]);
                    ps.syncDisplayedJsonToFull();

                    dataList = page.popupPages.getDataList(ps);

                    expect(dataList.length).toEqual(2);
                    expect(dataList[1].id).toEqual(popupId + '2');
                });
            });

            describe('isPopup', function() {
                it('should be truthy for popups', function() {
                    siteData.addPopupPageWithDefaults(popupId, [popupContainer]);

                    expect(page.popupPages.isPopup(ps, popupId)).toBeTruthy();
                });

                it('should be falsy for pages', function() {
                    siteData.addPageWithDefaults('page');

                    expect(page.popupPages.isPopup(ps, 'page')).toBeFalsy();
                });
            });

            describe('isPopupOpened', function() {
                it('should be truthy for popups', function() {
                    siteData.addPopupPageWithDefaults(popupId, [popupContainer]);
                    siteData._currentPageIds.popupPage = popupId;

                    expect(page.popupPages.isPopupOpened(ps)).toBeTruthy();
                });

                it('should be falsy for pages', function() {
                    siteData._currentPageIds.popupPage = null;

                    expect(page.popupPages.isPopupOpened(ps)).toBeFalsy();
                });
            });
        });

    });
});
