define(['documentServices/componentsMetaData/components/screenWidthContainerMetaData', 'documentServices/mockPrivateServices/privateServicesHelper', 'documentServices/constants/constants', 'documentServices/componentsMetaData/componentsMetaData'], function (screenWidthContainerMetaData, privateServicesHelper, constants, componentsMetaData) {
    'use strict';
    var mockPrivateServices;

    describe('screenWidthContainerMetaData - ', function() {
        var screenWidthContainer, footer, header, someComp;

        beforeEach(function() {
            var siteData = privateServicesHelper.getSiteDataWithPages({'mainPage': {components:
                [{id:'screenWidth', componentType: 'wysiwyg.viewer.components.ScreenWidthContainer'},
                    {id: 'footer', componentType: 'wysiwyg.viewer.components.FooterContainer'},
                    {id: 'header', componentType: 'wysiwyg.viewer.components.HeaderContainer'},
                    {id: 'someId', componentType: 'someType'}]}
            });
            mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            var pagePointer = mockPrivateServices.pointers.components.getPage('mainPage', constants.VIEW_MODES.DESKTOP);
            screenWidthContainer = mockPrivateServices.pointers.components.getComponent('screenWidth', pagePointer);
            footer = mockPrivateServices.pointers.components.getComponent('footer', pagePointer);
            header = mockPrivateServices.pointers.components.getComponent('header', pagePointer);
            someComp = mockPrivateServices.pointers.components.getComponent('someId', pagePointer);
        });

        describe('containable function', function () {
            it('should return true if containerCompType is header', function () {
                var containable = componentsMetaData.public.isContainable(mockPrivateServices, screenWidthContainer, header);
                expect(containable).toBe(true);
            });
            it('should return true if containerCompType is footer', function () {
                var containable = componentsMetaData.public.isContainable(mockPrivateServices, screenWidthContainer, footer);
                expect(containable).toBe(true);
            });
            it('should return false if componentCompType!=header/footer/page', function () {
                var containable = componentsMetaData.public.isContainable(mockPrivateServices, screenWidthContainer, someComp);
                expect(containable).toBe(false);
            });
        });

        it('resizableSides should be top & bottom', function () {
            var expectedSides = [constants.RESIZE_SIDES.TOP, constants.RESIZE_SIDES.BOTTOM];
            expect(screenWidthContainerMetaData.resizableSides).toEqual(expectedSides);
        });

        it('moveDirections should be vertical', function () {
            var expectedDirections = [constants.MOVE_DIRECTIONS.VERTICAL];
            expect(screenWidthContainerMetaData.moveDirections).toEqual(expectedDirections);
        });
    });
});
