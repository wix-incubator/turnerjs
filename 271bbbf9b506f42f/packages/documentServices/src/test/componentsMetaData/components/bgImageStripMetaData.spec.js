define(['documentServices/componentsMetaData/components/bgImageStripMetaData', 'documentServices/mockPrivateServices/privateServicesHelper', 'documentServices/componentsMetaData/metaDataUtils', 'documentServices/constants/constants', 'documentServices/componentsMetaData/componentsMetaData'], function (bgImageStripMetaData, privateServicesHelper, metaDataUtils, constants, componentsMetaData) {
    'use strict';
    var mockPrivateServices;


    describe('bgImageStrip Meta Data - ', function() {
        var bgImageStrip, siteSegment, nonSiteSegment;

        function getCompPointer(ps, compId, pageId){
            var pagePointer = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
            return ps.pointers.components.getComponent(compId, pagePointer);
        }

        beforeEach(function() {
            var siteData = privateServicesHelper.getSiteDataWithPages({'mainPage': {components:
                [{id:'bgImageStrip', componentType: 'wysiwyg.viewer.components.BgImageStrip'},
                    {id: 'siteSegment', componentType: 'wysiwyg.viewer.components.FooterContainer'},
                    {id: 'non-siteSegment'}]}
            });
            mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            bgImageStrip = getCompPointer(mockPrivateServices, 'bgImageStrip', 'mainPage');
            siteSegment = getCompPointer(mockPrivateServices, 'siteSegment', 'mainPage');
            nonSiteSegment = getCompPointer(mockPrivateServices, 'non-siteSegment', 'mainPage');
        });

        describe('containable function', function() {
            it('should return true if container comp is a site segment', function () {
                var containable = componentsMetaData.public.isContainable(mockPrivateServices, bgImageStrip, siteSegment);

                expect(containable).toBe(true);
            });

            it('should return true if container comp masterPage', function () {
                var masterPagePointer = mockPrivateServices.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);
                var containable = componentsMetaData.public.isContainable(mockPrivateServices, bgImageStrip, masterPagePointer);

                expect(containable).toBe(true);
            });

            it('should return false if container compType is not a site segment and not masterPage', function () {
                var containable = componentsMetaData.public.isContainable(mockPrivateServices, bgImageStrip, nonSiteSegment);

                expect(containable).toBe(false);
            });
        });

        it('resizableSides should be top and bottom', function() {
            var expectedSides = [constants.RESIZE_SIDES.TOP, constants.RESIZE_SIDES.BOTTOM];
            expect(bgImageStripMetaData.resizableSides).toEqual(expectedSides);
        });
    });
});
