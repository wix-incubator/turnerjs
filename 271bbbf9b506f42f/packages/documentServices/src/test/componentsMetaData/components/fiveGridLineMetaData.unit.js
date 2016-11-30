define(['documentServices/componentsMetaData/components/fiveGridLineMetaData',
        'documentServices/mockPrivateServices/privateServicesHelper', 'documentServices/dataModel/dataModel', 'documentServices/constants/constants', 'documentServices/componentsMetaData/metaDataUtils',
        'documentServices/componentsMetaData/componentsMetaData',
        'utils'],
    function(fiveGridLineMetaData,
             privateServicesHelper,
             dataModel,
             constants,
             metaDataUtils,
             componentsMetaData,
             utils) {
        'use strict';


        var mockPrivateServices;

        describe('fiveGridLine Meta Data - ', function() {
            var fiveGridLine, container, validContainer;

            beforeEach(function() {
                var siteData = privateServicesHelper.getSiteDataWithPages({'mainPage': {components:
                    [{id:'fiveGridLine', componentType: 'wysiwyg.viewer.components.FiveGridLine'}, {id: 'container', componentType: 'core.components.Container'},
                        {id: 'validContainer', componentType: 'wysiwyg.viewer.components.HeaderContainer'}]}
                });
                mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                var pagePointer = mockPrivateServices.pointers.components.getPage('mainPage', constants.VIEW_MODES.DESKTOP);
                fiveGridLine = mockPrivateServices.pointers.components.getComponent('fiveGridLine', pagePointer);
                container = mockPrivateServices.pointers.components.getComponent('container', pagePointer);
                validContainer = mockPrivateServices.pointers.components.getComponent('validContainer', pagePointer);
            });


            describe('containable', function () {
                it('Should return true if not in full width mode', function () {
                    spyOn(dataModel, 'getPropertiesItem').and.returnValue({
                        fullScreenModeOn: false
                    });
                    spyOn(metaDataUtils, 'isContainer').and.returnValue(true);

                    var containable = componentsMetaData.public.isContainable(mockPrivateServices, fiveGridLine, container);

                    expect(containable).toBe(true);
                });

                it('Should return false if in full width mode & the container comp type is core.components.Container', function () {
                    spyOn(utils.dockUtils, 'isHorizontalDockToScreen').and.returnValue(true);

                    var containable = componentsMetaData.public.isContainable(mockPrivateServices, fiveGridLine, container);
                    expect(containable).toBe(false);
                });

                it('Should return true if in full width mode & the container is a valid container', function () {
                    spyOn(metaDataUtils, 'isContainer').and.returnValue(true);
                    spyOn(dataModel, 'getPropertiesItem').and.returnValue({
                        fullScreenModeOn: true
                    });
                    var containable = componentsMetaData.public.isContainable(mockPrivateServices, fiveGridLine, validContainer);
                    expect(containable).toBe(true);
                });
            });

            describe('rotatable', function () {
                it('Should return true if comp is not stretched', function () {
                    spyOn(utils.dockUtils, 'isStretched').and.returnValue(false);

                    var rotatable = fiveGridLineMetaData.rotatable(mockPrivateServices, 'fiveGridLine');

                    expect(rotatable).toBe(true);

                });

                it('Should return false comp is stretched', function () {
                    spyOn(utils.dockUtils, 'isStretched').and.returnValue(true);
                    var rotatable = fiveGridLineMetaData.rotatable(mockPrivateServices, 'fiveGridLine');

                    expect(rotatable).toBe(false);
                });
            });

            describe('resizableSides', function () {
                it('Should return left and right when comp is/is not stretched', function () {
                    spyOn(utils.dockUtils, 'isStretched').and.returnValue(true);
                    var resizableSidesWhenCompIsStretched = fiveGridLineMetaData.resizableSides(mockPrivateServices, 'fiveGridLine');
                    expect(resizableSidesWhenCompIsStretched).toEqual([constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.RIGHT]);

                    utils.dockUtils.isStretched.and.returnValue(false);
                    var resizableSidesWhenCompIsNotStreteched = fiveGridLineMetaData.resizableSides(mockPrivateServices, 'fiveGridLine');
                    expect(resizableSidesWhenCompIsNotStreteched).toEqual([constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.RIGHT]);
                });
            });

            describe('moveDirections', function () {
                it('Should return Horizontal & Vertical when comp is not stretched', function () {
                    spyOn(utils.dockUtils, 'isStretched').and.returnValue(false);

                    var moveDirections = fiveGridLineMetaData.moveDirections(mockPrivateServices, 'fiveGridLine');

                    expect(moveDirections).toEqual([constants.MOVE_DIRECTIONS.HORIZONTAL, constants.MOVE_DIRECTIONS.VERTICAL]);
                });

                it('Should return vertical when comp is stretched', function () {
                    spyOn(utils.dockUtils, 'isStretched').and.returnValue(true);

                    var moveDirections = fiveGridLineMetaData.moveDirections(mockPrivateServices, 'fiveGridLine');

                    expect(moveDirections).toEqual([constants.MOVE_DIRECTIONS.VERTICAL]);
                });
            });

        });
    });
