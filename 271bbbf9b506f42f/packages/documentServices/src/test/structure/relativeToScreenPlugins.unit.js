define(['lodash',
    'documentServices/constants/constants',
    'documentServices/component/componentStructureInfo',
    'documentServices/componentsMetaData/metaDataUtils',
    'documentServices/page/popupUtils',

    /* Plugins */
    'documentServices/structure/relativeToScreenPlugins/columnsPlugin',
    'documentServices/structure/relativeToScreenPlugins/screenWidthPlugin',
    'documentServices/structure/relativeToScreenPlugins/fullViewPortPlugin',
    'documentServices/structure/relativeToScreenPlugins/siteStructurePlugin',
    'documentServices/structure/relativeToScreenPlugins/anchorPlugin',
    'documentServices/structure/relativeToScreenPlugins/textHeightPlugin',
    'documentServices/structure/relativeToScreenPlugins/verticalLinePlugin',
    'documentServices/structure/relativeToScreenPlugins/horizontalLinePlugin',
    'documentServices/structure/relativeToScreenPlugins/popupContainerWidthPlugin',

    'experiment',

    'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/structure/relativeToScreenPlugins/relativeToScreenPlugins'

], function(
    _,
    constants,
    componentStructureInfo,
    metaDataUtils,
    popupUtils,
    columnsPlugin,
    screenWidthPlugin,
    fullViewPortPlugin,
    siteStructurePlugin,
    anchorPlugin,
    textHeightPlugin,
    verticalLinePlugin,
    horizontalLinePlugin,
    popupContainerWidthPlugin,
    experiment,
    testUtils,
    privateServicesHelper,
    relativeToScreenPlugins
) {
    'use strict';


    function getCompPointer(ps, compId, pageId) {
        var page = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
        return ps.pointers.components.getComponent(compId, page);
    }

    describe('relativeToScreenPlugins.getPlugin', function() {
        var compPointer,
            siteData,
            privateApi;

        beforeEach(function() {
            siteData = testUtils.mockFactory.mockSiteData();
            privateApi = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
        });

        it('should return popupContainerWidthPlugin for wysiwyg.viewer.components.PopupContainer', function() {
            var popupContainer = {
                id: 'popupContainer',
                componentType: 'wysiwyg.viewer.components.PopupContainer'
            };
            siteData.addPopupPageWithDefaults('popup', [popupContainer]);
            compPointer = getCompPointer(privateApi, 'popupContainer', 'popup');

            expect(relativeToScreenPlugins.getPlugin(privateApi, compPointer)).toBe(popupContainerWidthPlugin);
        });

        describe('for full width container', function() {
            beforeEach(function() {
                spyOn(metaDataUtils, 'isLegacyFullWidthContainer').and.returnValue(true);
            });

            it('should return screenWidthPlugin', function() {
                var component = {
                    id: 'comp'
                };
                siteData.addPageWithDefaults('page', [component]);
                compPointer = getCompPointer(privateApi, 'comp', 'page');

                expect(relativeToScreenPlugins.getPlugin(privateApi, compPointer)).toBe(screenWidthPlugin);
            });

            it('should return fullViewPortPlugin for popup page', function() {
                var pagePointer;
                siteData.addPopupPageWithDefaults('popup');
                pagePointer = privateApi.pointers.components.getPage('popup', constants.VIEW_MODES.DESKTOP);
                expect(relativeToScreenPlugins.getPlugin(privateApi, pagePointer)).toBe(fullViewPortPlugin);
            });
        });
    });
});
