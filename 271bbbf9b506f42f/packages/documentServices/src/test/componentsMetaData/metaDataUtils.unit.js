define([
    'testUtils',
    'lodash',
    'documentServices/componentsMetaData/metaDataUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/documentMode/documentModeInfo',
    'documentServices/page/popupUtils'
], function (
    testUtils,
    _,
    metaDataUtils,
    privateServicesHelper,
    documentInfo,
    popupUtils
) {
    'use strict';

    describe('Meta-Data Utils', function () {
        describe('isSiteSegment', function () {
            it('Should return true if componentType = wysiwyg.viewer.components.SiteSegmentContainer', function () {
                expect(metaDataUtils.isSiteSegment('wysiwyg.viewer.components.SiteSegmentContainer')).toBe(true);
            });

            it('Should return true if componentType = wysiwyg.viewer.components.FooterContainer', function () {
                expect(metaDataUtils.isSiteSegment('wysiwyg.viewer.components.FooterContainer')).toBe(true);
            });

            it('Should return true if componentType = wysiwyg.viewer.components.HeaderContainer', function () {
                expect(metaDataUtils.isSiteSegment('wysiwyg.viewer.components.HeaderContainer')).toBe(true);
            });

            it('Should return true if componentType = wysiwyg.viewer.components.PagesContainer', function () {
                expect(metaDataUtils.isSiteSegment('wysiwyg.viewer.components.PagesContainer')).toBe(true);
            });

            it('Shoudl return false if componentType is not a site segment', function () {
                expect(metaDataUtils.isSiteSegment('some.component.type')).toBe(false);
            });
        });

        describe('isContainer', function() {
            var CONTAINERS = [
                'core.components.Container',
                'core.components.ContainerOBC',
                'wysiwyg.viewer.components.PopupContainer',
                'core.components.Page',
                'mobile.core.components.Page',
                'mobile.core.components.SiteStructure',
                'wixapps.integration.components.common.formcontainer.viewer.FormContainer'
            ];

            _.forEach(CONTAINERS, function(containerType) {
                it('should return true for ' + containerType, function() {
                    expect(metaDataUtils.isContainer(containerType)).toBe(true);
                });
            });

            it('should return false for non-container compTypes', function() {
                expect(metaDataUtils.isContainer('someType')).toBe(false);
            });
        });


        describe('containable', function() {
            var mockFactory, siteData, ps, viewMode,
                refs = {},
                popupId = 'popup1',
                comp = {id: 'someComp'},
                popupContainer = {
                    id: 'popupContainer',
                    componentType: 'wysiwyg.viewer.components.PopupContainer',
                    skin: 'wysiwyg.viewer.skins.stripContainer.DefaultStripContainer',
                    props: {
                        type: 'PopupContainerProperties'
                    },
                    components: [comp]
                };


            beforeEach(function() {
                mockFactory = testUtils.mockFactory;
                siteData = mockFactory.mockSiteData();
                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                viewMode = documentInfo.getViewMode(ps);

                siteData.addPopupPageWithDefaults(popupId, [popupContainer]);
                siteData._currentPageIds.popupPage = popupId;
                refs.popup = ps.pointers.components.getPage(popupId, viewMode);
                refs.popupContainer = ps.pointers.components.getComponent('popupContainer', refs.popup);
                refs.comp = ps.pointers.components.getComponent('someComp', refs.popup);
            });

            describe('byFullWidthPopup', function() {

                it('should return true for pages', function() {
                    var pageId = 'page';
                    siteData.addPageWithDefaults(pageId, [{id: 'containerComp', components: [comp]}]);
                    siteData._currentPageIds.popupPage = pageId;
                    var pageRef = ps.pointers.components.getPage(pageId, viewMode);

                    expect(metaDataUtils.containableByFullWidthPopup(
                        ps,
                        ps.pointers.components.getComponent(comp.id, pageRef),
                        ps.pointers.components.getComponent('containerComp', pageRef)
                    )).toBe(true);
                });

                it('should return false for not full width width popups', function() {
                    spyOn(popupUtils, 'isPopupFullWidth').and.returnValue(false);

                    expect(metaDataUtils.containableByFullWidthPopup(ps, refs.comp, refs.popupContainer)).toBe(false);
                });

                it('should return true for full width popups', function() {
                    spyOn(popupUtils, 'isPopupFullWidth').and.returnValue(true);

                    expect(metaDataUtils.containableByFullWidthPopup(ps, refs.comp, refs.popupContainer)).toBe(true);
                });
            });


            describe('notByPopup', function() {

                it('should return true for pages', function() {
                    var pageId = 'page';
                    siteData.addPageWithDefaults(pageId, [{id: 'containerComp', components: [comp]}]);
                    siteData._currentPageIds.popupPage = pageId;
                    var pageRef = ps.pointers.components.getPage(pageId, viewMode);

                    expect(metaDataUtils.notContainableByPopup(
                        ps,
                        ps.pointers.components.getComponent(comp.id, pageRef),
                        ps.pointers.components.getComponent('containerComp', pageRef)
                    )).toBe(true);
                });

                it('should return false for popups', function() {
                    expect(metaDataUtils.notContainableByPopup(ps, refs.comp, refs.popupContainer)).toBe(false);
                });
            });

        });

    });
});
