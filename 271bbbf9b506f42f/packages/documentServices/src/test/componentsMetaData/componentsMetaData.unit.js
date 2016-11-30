define(['lodash',
    'utils',
    'testUtils',
    'definition!documentServices/componentsMetaData/componentsMetaData',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/theme/theme',
    'documentServices/structure/structure',
    'layout',
    'documentServices/page/popupUtils',
    'documentServices/constants/constants',
    'documentServices/componentsMetaData/metaDataUtils',
    'documentServices/documentMode/documentMode',
    'siteUtils/core/componentsAnchorsMetaData',
    'documentServices/componentsMetaData/components/hoverboxMetaData',
    'experiment'], function
    (_,
     utils,
     testUtils,
     componentsMetaDataDef,
     privateServicesHelper,
     theme,
     structure,
     layout,
     popupUtils,
     constants,
     metaDataUtils,
     documentMode,
     componentsAnchorsMetaData,
     hoverboxMetaData,
     experiment) {
    'use strict';

    describe('Components Meta Data API', function () {

        var fakeMetaDataMap, mockMetaData;

        var mockPrivateServices;

        /** documentServices.componentsMetaData */
        var componentsMetaData;

        var someComponent, componentA, container, childOfContainer, mainPagePointer, header, stripA, stripB, controller, siteSegmentContainer, firstHoverbox, secondHoverbox;

        function dockHorizontallyToScreen(ps, component) {
            var compLayoutPointer = ps.pointers.getInnerPointer(component, 'layout');
            var compLayout = ps.dal.get(compLayoutPointer);
            compLayout.docked = {left: {vw: 0}, right: {vw: 0}};
            ps.dal.set(compLayoutPointer, compLayout);
        }

        beforeEach(function () {
            mockMetaData = {
                componentA: {
                    anchors: 'someAnchors',
                    containable: jasmine.createSpy(),
                    containableByStructure: jasmine.createSpy(),
                    moveDirections: [constants.MOVE_DIRECTIONS.HORIZONTAL, constants.MOVE_DIRECTIONS.VERTICAL],
                    resizableSides: ['someResizableSide']
                },
                container: {
                    container: true
                },
                'wysiwyg.viewer.components.HoverBox': hoverboxMetaData
            };
            fakeMetaDataMap = {
                getMap: function () {
                    return mockMetaData;
                }
            };

            var defaultLayout = {x: 0, y: 0, width: 5, height: 5};
            var siteData = privateServicesHelper.getSiteDataWithPages({
                'mainPage': {
                    components: [
                        {id: 'componentA', componentType: 'componentA', layout: {}},
                        {id: 'someComponent', componentType: 'mockType', layout: {}},
                        {id: 'header', componentType: 'wysiwyg.viewer.components.HeaderContainer', layout: {}},
                        {
                            id: 'container',
                            componentType: 'mobile.core.components.Container',
                            layout: defaultLayout,
                            components: [
                                {id: 'childOfContainer', componentType: 'mobile.core.components.Container', layout: {}}
                            ]
                        },
                        {
                            id: 'horizontalStretchedToScreen',
                            componentType: 'someComp',
                            layout: {docked: {left: {vw: 0}, right: {vw: 0}}}
                        },
                        {id: 'stripA', componentType: 'wysiwyg.viewer.components.StripContainer', layout: {}},
                        {id: 'stripB', componentType: 'wysiwyg.viewer.components.StripContainer', layout: {}},
                        {id: 'oldStrip', componentType: 'wysiwyg.viewer.components.ScreenWidthContainer', layout: {}},
                        {
                            id: 'stripSlideshow',
                            componentType: 'wysiwyg.viewer.components.StripContainerSlideShow',
                            layout: {}
                        },
                        {id: 'controller', componentType: 'platform.components.AppController', layout: {}},
                        {
                            id: 'siteSegmentContainer',
                            componentType: 'wysiwyg.viewer.components.SiteSegmentContainer',
                            layout: {}
                        },
                        {
                            id: 'stripColumns',
                            componentType: 'wysiwyg.viewer.components.StripColumnsContainer',
                            layout: {}
                        },
                        {id: 'firstHoverbox', componentType: 'wysiwyg.viewer.components.HoverBox', layout: defaultLayout, components: []},
                        {id: 'secondHoverbox', componentType: 'wysiwyg.viewer.components.HoverBox', layout: defaultLayout, components: []}
                    ]
                }
            });
            mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            mainPagePointer = getPagePointer(mockPrivateServices, 'mainPage');
            someComponent = getCompPointer(mockPrivateServices, 'someComponent', mainPagePointer);
            componentA = getCompPointer(mockPrivateServices, 'componentA', mainPagePointer);
            container = getCompPointer(mockPrivateServices, 'container', mainPagePointer);
            childOfContainer = getCompPointer(mockPrivateServices, 'childOfContainer', mainPagePointer);
            header = getCompPointer(mockPrivateServices, 'header', mainPagePointer);
            stripA = getCompPointer(mockPrivateServices, 'stripA', mainPagePointer);
            stripB = getCompPointer(mockPrivateServices, 'stripB', mainPagePointer);
            controller = getCompPointer(mockPrivateServices, 'controller', mainPagePointer);
            firstHoverbox = getCompPointer(mockPrivateServices, 'firstHoverbox', mainPagePointer);
            secondHoverbox = getCompPointer(mockPrivateServices, 'secondHoverbox', mainPagePointer);
            siteSegmentContainer = getCompPointer(mockPrivateServices, 'siteSegmentContainer', mainPagePointer);

            componentsMetaData = componentsMetaDataDef(_, utils, fakeMetaDataMap, theme, layout, constants, metaDataUtils,
                documentMode, popupUtils, experiment);
        });

        function getPagePointer(ps, pageId) {
            return ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
        }

        function getCompPointer(ps, compId, pagePointer) {
            return ps.pointers.components.getComponent(compId, pagePointer);
        }

        function updateComponentRotationInDegrees(ps, componentPointer, rotationInDegrees) {
            var compLayoutPointer = ps.pointers.getInnerPointer(componentPointer, 'layout');
            var compLayout = ps.dal.get(compLayoutPointer);
            compLayout.rotationInDegrees = rotationInDegrees;
            ps.dal.set(compLayoutPointer, compLayout);
        }

        describe('Default meta data -', function () {

            it('isGroupable should return false for components docked horizontally to screen by default, if no parent container is specified', function () {

                var stretchedComp = getCompPointer(mockPrivateServices, 'horizontalStretchedToScreen', mainPagePointer);

                expect(componentsMetaData.public.isGroupable(mockPrivateServices, stretchedComp)).toBe(false);
            });

            it('isContainableByStructure should return true if the parent is a container', function () {
                expect(componentsMetaData.public.isContainableByStructure(mockPrivateServices, someComponent, container)).toBe(true);
            });

            it('isContainableByStructure should return false if the parent is not a container', function () {
                expect(componentsMetaData.public.isContainableByStructure(mockPrivateServices, someComponent, componentA)).toBe(false);
            });

            it('isMovable should return true', function () {
                expect(componentsMetaData.public.isMovable(mockPrivateServices, someComponent)).toBe(true);
            });

            it('isRotatable should return false', function () {
                expect(componentsMetaData.public.isRotatable(mockPrivateServices, someComponent)).toBe(false);
            });

            it('isModal should return false', function () {
                expect(componentsMetaData.public.isModal(mockPrivateServices, someComponent)).toBe(false);
            });

            it('getResizableSides should return [top, left, bottom, right]', function () {
                var expectedResizableSides = [constants.RESIZE_SIDES.TOP, constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.BOTTOM, constants.RESIZE_SIDES.RIGHT];

                expect(componentsMetaData.public.getResizableSides(mockPrivateServices, someComponent)).toEqual(expectedResizableSides);
            });

            it('canBeFixedPosition should return true', function () {
                expect(componentsMetaData.public.canBeFixedPosition(mockPrivateServices, someComponent)).toBe(true);
            });

            it('canBeStretched should return false', function () {
                expect(componentsMetaData.public.canBeStretched(mockPrivateServices, someComponent)).toBe(false);
            });

            it('isRemovable should return true', function () {
                expect(componentsMetaData.public.isRemovable(mockPrivateServices, someComponent)).toBe(true);
            });

            it('isDuplicatable should return true', function () {
                expect(componentsMetaData.public.isDuplicatable(mockPrivateServices, someComponent)).toBe(true);
            });

            it('isFullWidthByStructure should return true for components docked horizontally to screen by default', function () {
                var screenWidthCompStructure = {
                    componentType: 'nonexisting comp type',
                    layout: {
                        docked: {
                            left: {vw: 0},
                            right: {vw: 0}
                        }
                    }
                };
                expect(componentsMetaData.public.isFullWidthByStructure(mockPrivateServices, screenWidthCompStructure)).toBe(true);
            });

            it('isEnforcingContainerChildLimitationsByWidth', function () {
                expect(componentsMetaData.public.isEnforcingContainerChildLimitationsByWidth(mockPrivateServices, someComponent)).toBe(true);
            });

            it('isEnforcingContainerChildLimitationsByHeight', function () {
                expect(componentsMetaData.public.isEnforcingContainerChildLimitationsByHeight(mockPrivateServices, someComponent)).toBe(true);
            });

            it('isAnchorableFrom should return true', function () {
                expect(componentsMetaData.public.isAnchorableFrom(mockPrivateServices, someComponent)).toBe(true);
            });

            it('isAnchorableTo should return true', function () {
                expect(componentsMetaData.public.isAnchorableTo(mockPrivateServices, someComponent)).toBe(true);
            });

            it('resizeOnlyProportionally should return false', function () {
                expect(componentsMetaData.public.resizeOnlyProportionally(mockPrivateServices, someComponent)).toBe(false);
            });
        });

        describe('Inner getCompMetaData functionality', function () {
            it('Should return the default isAble value for a component that doesn\'t override the value', function () {
                expect(componentsMetaData.public.isRotatable(mockPrivateServices, someComponent)).toBe(false);
            });

            it('Should return component specific isAble value if defined', function () {
                mockMetaData.componentA.rotatable = true;
                expect(componentsMetaData.public.isRotatable(mockPrivateServices, componentA)).toBe(true);
            });

            function stretchComponent(ps, componentPointer) {
                var compLayoutPointer = ps.pointers.getInnerPointer(componentPointer, 'layout');
                var compLayout = ps.dal.get(compLayoutPointer);
                compLayout.docked = {left: {px: 0}, right: {px: 0}};

                ps.dal.set(compLayoutPointer, compLayout);
            }

            it('should return false for stretched components', function () {
                stretchComponent(mockPrivateServices, componentA);
                mockMetaData.componentA.rotatable = true;
                expect(componentsMetaData.public.isRotatable(mockPrivateServices, componentA)).toBe(false);
            });
        });

        describe('Meta Data Methods', function () {
            /* This test suite makes sure all public functions exist
             and pass the correct parameters to the getCompMetaData private function */

            it('isContainable should get containable isAble value according to containerComponentType', function () {
                componentsMetaData.public.isContainable(mockPrivateServices, componentA, container);
                expect(mockMetaData.componentA.containable).toHaveBeenCalledWith(mockPrivateServices, componentA, container);
            });

            describe('isContainableByStructure', function () {
                it('should get containable isAble value according to containerComponentType', function () {
                    var compStructure = {componentType: 'componentA'};
                    componentsMetaData.public.isContainableByStructure(mockPrivateServices, compStructure, container);
                    expect(mockMetaData.componentA.containableByStructure).toHaveBeenCalledWith(mockPrivateServices, compStructure, container);
                });
                it('should return false if structure.layout is horizontally stretched to screen and potential container is not legacy full width', function () {
                    var compStructure = {componentType: 'componentA'};
                    spyOn(utils.dockUtils, 'isHorizontalDockToScreen').and.returnValue(true);
                    spyOn(metaDataUtils, 'isLegacyFullWidthContainer').and.returnValue(false);
                    spyOn(metaDataUtils, 'isLegacyFullWidthContainerByType').and.returnValue(false);
                    mockMetaData.componentA.containableByStructure.and.returnValue(true);
                    expect(componentsMetaData.public.isContainableByStructure(mockPrivateServices, compStructure, container)).toBe(false);
                });
                it('should return true if structure.layout is horizontally stretched to screen and potential container is legacy full width', function () {
                    var compStructure = {componentType: 'componentA'};
                    spyOn(utils.dockUtils, 'isHorizontalDockToScreen').and.returnValue(true);
                    spyOn(metaDataUtils, 'isLegacyFullWidthContainer').and.returnValue(true);
                    spyOn(metaDataUtils, 'isLegacyFullWidthContainerByType').and.returnValue(true);
                    mockMetaData.componentA.containableByStructure.and.returnValue(true);
                    expect(componentsMetaData.public.isContainableByStructure(mockPrivateServices, compStructure, container)).toBe(true);
                });
            });

            describe('isContainer', function () {
                it('should return true if componentType is a container', function () {
                    expect(componentsMetaData.public.isContainer(mockPrivateServices, container)).toBe(true);
                });

                it('should return true if a component is a container for dock to screen comps', function () {
                    expect(componentsMetaData.public.isPotentialContainerForScreenWidthComp(mockPrivateServices, header)).toBe(true);
                });

                it('should return false if a component is a not container for dock to screen comps', function () {
                    expect(componentsMetaData.public.isPotentialContainerForScreenWidthComp(mockPrivateServices, someComponent)).toBe(false);
                });
            });

            describe('isEnforcingContainerChildLimitations', function () {
                var origIsEnforcing;

                beforeEach(function () {
                    origIsEnforcing = _.pick(mockMetaData.componentA, ['enforceContainerChildLimitsByWidth', 'enforceContainerChildLimitsByHeight']);
                });

                afterEach(function () {
                    _.assign(mockMetaData.componentA, origIsEnforcing);
                });

                it('should return false if isEnforcingContainerChildLimitationsByWidth & isEnforcingContainerChildLimitationsByHeight are false', function () {
                    mockMetaData.componentA.enforceContainerChildLimitsByWidth = false;
                    mockMetaData.componentA.enforceContainerChildLimitsByHeight = false;

                    var isEnforcing = componentsMetaData.public.isEnforcingContainerChildLimitations(mockPrivateServices, componentA);

                    expect(isEnforcing).toBe(false);
                });

                it('should return true if isEnforcingContainerChildLimitationsByWidth is true & isEnforcingContainerChildLimitationsByHeight is false', function () {
                    mockMetaData.componentA.enforceContainerChildLimitsByWidth = true;
                    mockMetaData.componentA.enforceContainerChildLimitsByHeight = false;

                    var isEnforcing = componentsMetaData.public.isEnforcingContainerChildLimitations(mockPrivateServices, componentA);

                    expect(isEnforcing).toBe(true);
                });

                it('should return true if isEnforcingContainerChildLimitationsByWidth is false & isEnforcingContainerChildLimitationsByHeight is true', function () {
                    mockMetaData.componentA.enforceContainerChildLimitsByWidth = false;
                    mockMetaData.componentA.enforceContainerChildLimitsByHeight = true;

                    var isEnforcing = componentsMetaData.public.isEnforcingContainerChildLimitations(mockPrivateServices, componentA);

                    expect(isEnforcing).toBe(true);
                });

                it('should return true if isEnforcingContainerChildLimitationsByWidth & isEnforcingContainerChildLimitationsByHeight are true', function () {
                    mockMetaData.componentA.enforceContainerChildLimitsByWidth = true;
                    mockMetaData.componentA.enforceContainerChildLimitsByHeight = true;

                    var isEnforcing = componentsMetaData.public.isEnforcingContainerChildLimitations(mockPrivateServices, componentA);

                    expect(isEnforcing).toBe(true);
                });
            });

            describe('isHorizontallyMovable', function () {
                var origMoveDirections;

                beforeEach(function () {
                    origMoveDirections = mockMetaData.componentA.moveDirections;
                });

                afterEach(function () {
                    mockMetaData.componentA.moveDirections = origMoveDirections;
                });

                it('should return true if moveDirections include horizontal', function () {
                    mockMetaData.componentA.moveDirections = [constants.MOVE_DIRECTIONS.HORIZONTAL, 'someDirection'];
                    var isHorizMovable = componentsMetaData.public.isHorizontallyMovable(mockPrivateServices, componentA);
                    expect(isHorizMovable).toBe(true);
                });

                it('should return false if moveDirections don\'t include horizontal', function () {
                    mockMetaData.componentA.moveDirections = ['someDirection', constants.MOVE_DIRECTIONS.VERTICAL];
                    var isHorizMovable = componentsMetaData.public.isHorizontallyMovable(mockPrivateServices, componentA);
                    expect(isHorizMovable).toBe(false);
                });
            });

            describe('isVerticallyMovable', function () {
                var origMoveDirections;

                beforeEach(function () {
                    origMoveDirections = mockMetaData.componentA.moveDirections;
                });

                afterEach(function () {
                    mockMetaData.componentA.moveDirections = origMoveDirections;
                });

                it('should return true if moveDirections include vertical', function () {
                    mockMetaData.componentA.moveDirections = [constants.MOVE_DIRECTIONS.VERTICAL, 'someDirection'];
                    var isHorizMovable = componentsMetaData.public.isVerticallyMovable(mockPrivateServices, componentA);
                    expect(isHorizMovable).toBe(true);
                });

                it('should return false if moveDirections don\'t include vertical', function () {
                    mockMetaData.componentA.moveDirections = ['someDirection', constants.MOVE_DIRECTIONS.HORIZONTAL];
                    var isHorizMovable = componentsMetaData.public.isVerticallyMovable(mockPrivateServices, componentA);
                    expect(isHorizMovable).toBe(false);
                });
            });

            it('getResizableSides should return the resizable sides array', function () {
                var resizableSides = componentsMetaData.public.getResizableSides(mockPrivateServices, componentA);
                expect(resizableSides).toEqual(mockMetaData.componentA.resizableSides);
            });

            describe('isHorizontallyResizable', function () {
                var origResizableSides;

                beforeEach(function () {
                    origResizableSides = mockMetaData.componentA.resizableSides;
                });

                afterEach(function () {
                    mockMetaData.componentA.resizableSides = origResizableSides;
                });

                it('Should return true if resizable sides include RESIZE_LEFT', function () {
                    mockMetaData.componentA.resizableSides = [constants.RESIZE_SIDES.LEFT, 'someResize'];
                    var isHorizResizable = componentsMetaData.public.isHorizontallyResizable(mockPrivateServices, componentA);

                    expect(isHorizResizable).toEqual(true);
                });

                it('Should return true if resizable sides include RESIZE_RIGHT', function () {
                    mockMetaData.componentA.resizableSides = [constants.RESIZE_SIDES.RIGHT, 'someResize'];
                    var isHorizResizable = componentsMetaData.public.isHorizontallyResizable(mockPrivateServices, componentA);

                    expect(isHorizResizable).toEqual(true);
                });

                it('Should return false if resizable sides don\'t include right or left', function () {
                    mockMetaData.componentA.resizableSides = ['someResizeSide', 'someOtherSide'];
                    var isHorizResizable = componentsMetaData.public.isHorizontallyResizable(mockPrivateServices, componentA);
                    expect(isHorizResizable).toEqual(false);
                });
            });

            describe('isVerticallyResizable', function () {
                var origResizableSides;

                beforeEach(function () {
                    origResizableSides = mockMetaData.componentA.resizableSides;
                });

                afterEach(function () {
                    mockMetaData.componentA.resizableSides = origResizableSides;
                });

                it('Should return true if resizable sides include RESIZE_TOP', function () {
                    mockMetaData.componentA.resizableSides = [constants.RESIZE_SIDES.TOP, 'someResize'];
                    var isVerticallyResizable = componentsMetaData.public.isVerticallyResizable(mockPrivateServices, componentA);
                    expect(isVerticallyResizable).toEqual(true);
                });

                it('Should return true if resizable sides include RESIZE_BOTTOM', function () {
                    mockMetaData.componentA.resizableSides = [constants.RESIZE_SIDES.BOTTOM, 'someResize'];
                    var isVerticallyResizable = componentsMetaData.public.isVerticallyResizable(mockPrivateServices, componentA);
                    expect(isVerticallyResizable).toEqual(true);
                });

                it('Should return false if resizable sides don\'t include top or bottom', function () {
                    mockMetaData.componentA.resizableSides = ['someResizeSide', 'someOtherSide'];
                    var isVerticallyResizable = componentsMetaData.public.isVerticallyResizable(mockPrivateServices, componentA);
                    expect(isVerticallyResizable).toEqual(false);
                });
            });

            describe('isResizable', function () {
                var origResizableSides;

                beforeEach(function () {
                    origResizableSides = mockMetaData.componentA.resizableSides;
                });

                afterEach(function () {
                    mockMetaData.componentA.resizableSides = origResizableSides;
                });

                it('Should return true if resizable sides array contains sides', function () {
                    mockMetaData.componentA.resizableSides = ['someResizeSide', 'someOtherSide'];
                    var isResizable = componentsMetaData.public.isResizable(mockPrivateServices, componentA);
                    expect(isResizable).toBe(true);
                });

                it('Should return false if resizable sides array is empty', function () {
                    mockMetaData.componentA.resizableSides = [];
                    var isResizable = componentsMetaData.public.isResizable(mockPrivateServices, componentA);
                    expect(isResizable).toBe(false);
                });
            });

            describe('canBeFixedPosition', function () {
                it('Should return true if the metaData specifies it is possible, meaning the viewer supports it', function () {
                    mockMetaData.componentA.canBeFixedPosition = true;
                    expect(componentsMetaData.public.canBeFixedPosition(mockPrivateServices, componentA)).toBe(true);
                });
            });

            describe('canBeStretched', function () {
                it('Should return false if the component is rotated', function () {
                    updateComponentRotationInDegrees(mockPrivateServices, componentA, 15);
                    mockMetaData.componentA.canBeStretched = true;
                    expect(componentsMetaData.public.canBeStretched(mockPrivateServices, componentA)).toBe(false);
                });

                it('Should return true if the metaData specifies it is possible, and the component is not rotated', function () {
                    updateComponentRotationInDegrees(mockPrivateServices, componentA, 0);
                    mockMetaData.componentA.canBeStretched = true;
                    expect(componentsMetaData.public.canBeStretched(mockPrivateServices, componentA)).toBe(true);
                });
            });


            describe('canBeStretchedByStructure', function () {
                it('Should return false if the component is rotated', function () {
                    updateComponentRotationInDegrees(mockPrivateServices, componentA, 15);
                    mockMetaData.componentA.canBeStretched = true;
                    var compStructure = mockPrivateServices.dal.get(componentA);
                    expect(componentsMetaData.public.canBeStretchedByStructure(mockPrivateServices, compStructure)).toBe(false);
                });

                it('Should return true if the metaData specifies it is possible, and the component is not rotated', function () {
                    updateComponentRotationInDegrees(mockPrivateServices, componentA, 0);
                    mockMetaData.componentA.canBeStretched = true;
                    var compStructure = mockPrivateServices.dal.get(componentA);
                    expect(componentsMetaData.public.canBeStretchedByStructure(mockPrivateServices, compStructure)).toBe(true);
                });
            });

            describe('isRemovable', function () {
                it('Should return false if the metaData specifies it is not possible, meaning the component can NEVER be deleted (i.e. header, footer, pages container)', function () {
                    mockMetaData.componentA.removable = false;
                    expect(componentsMetaData.public.isRemovable(mockPrivateServices, componentA)).toBe(false);
                });
            });

            describe('isDuplicatable', function () {
                it('Should return false if the metaData specifies it is not possible, meaning the component can NEVER be duplicated (i.e. header, footer, pages container)', function () {
                    mockMetaData.componentA.duplicatable = false;
                    expect(componentsMetaData.public.isDuplicatable(mockPrivateServices, componentA)).toBe(false);
                });
            });

            describe('resizeOnlyProportionally', function () {
                it('Should return true if the metaData specifies that the component must keep a certain aspect ratio', function () {
                    mockMetaData.componentA.layoutLimits = {aspectRatio: 1};
                    expect(componentsMetaData.public.resizeOnlyProportionally(mockPrivateServices, componentA)).toBe(true);
                });
            });

            describe('isContainable', function () {
                it('isContainable should return true if the parent is a container', function () {
                    expect(componentsMetaData.public.isContainable(mockPrivateServices, someComponent, container)).toBe(true);
                });

                it('isContainable should return false if the parent is not a container', function () {
                    expect(componentsMetaData.public.isContainable(mockPrivateServices, someComponent, componentA)).toBe(false);
                });

                it('isContainable should return false if there is no parent', function () {
                    expect(componentsMetaData.public.isContainable(mockPrivateServices, someComponent)).toBe(false);
                });

                it('isContainable should return false if trying to insert parent into child', function () {
                    expect(componentsMetaData.public.isContainable(mockPrivateServices, container, childOfContainer)).toBe(false);
                });

                it('should return false if trying to insert old strip or slideshow  to strip', function () {
                    var oldStrip = getCompPointer(mockPrivateServices, 'oldStrip', mainPagePointer);
                    var stripSlideshow = getCompPointer(mockPrivateServices, 'stripSlideshow', mainPagePointer);

                    expect(componentsMetaData.public.isContainable(mockPrivateServices, oldStrip, stripA)).toBe(false);
                    expect(componentsMetaData.public.isContainable(mockPrivateServices, stripSlideshow, stripB)).toBe(false);
                });

                it('should return false if trying to insert old strip or slideshow to slideShow', function () {
                    var oldStrip = getCompPointer(mockPrivateServices, 'oldStrip', mainPagePointer);
                    var stripSlideshow = getCompPointer(mockPrivateServices, 'stripSlideshow', mainPagePointer);
                    expect(componentsMetaData.public.isContainable(mockPrivateServices, oldStrip, stripSlideshow)).toBe(false);
                    expect(componentsMetaData.public.isContainable(mockPrivateServices, stripSlideshow, stripSlideshow)).toBe(false);
                });

                it('should return false if trying to insert  old strip or slideshow  to  columns', function () {
                    var oldStrip = getCompPointer(mockPrivateServices, 'oldStrip', mainPagePointer);
                    var stripColumns = getCompPointer(mockPrivateServices, 'stripColumns', mainPagePointer);
                    var stripSlideshow = getCompPointer(mockPrivateServices, 'stripSlideshow', mainPagePointer);
                    expect(componentsMetaData.public.isContainable(mockPrivateServices, stripSlideshow, stripColumns)).toBe(false);
                    expect(componentsMetaData.public.isContainable(mockPrivateServices, oldStrip, stripColumns)).toBe(false);
                });

                it('should return false if trying to insert  old strip or slideshow  to  old strip', function () {
                    var oldStrip = getCompPointer(mockPrivateServices, 'oldStrip', mainPagePointer);
                    var stripSlideshow = getCompPointer(mockPrivateServices, 'stripSlideshow', mainPagePointer);
                    expect(componentsMetaData.public.isContainable(mockPrivateServices, oldStrip, oldStrip)).toBe(false);
                    expect(componentsMetaData.public.isContainable(mockPrivateServices, stripSlideshow, oldStrip)).toBe(false);
                });

                it('should return TRUE if trying to insert new strip or columns to strip', function () {
                    var stripColumns = getCompPointer(mockPrivateServices, 'stripColumns', mainPagePointer);

                    expect(componentsMetaData.public.isContainable(mockPrivateServices, stripB, stripA)).toBe(true);
                    expect(componentsMetaData.public.isContainable(mockPrivateServices, stripColumns, stripB)).toBe(true);
                });

                it('should return true if trying to insert new strip or columns to slideShow', function () {
                    var stripColumns = getCompPointer(mockPrivateServices, 'stripColumns', mainPagePointer);
                    var stripSlideshow = getCompPointer(mockPrivateServices, 'stripSlideshow', mainPagePointer);
                    expect(componentsMetaData.public.isContainable(mockPrivateServices, stripA, stripSlideshow)).toBe(true);
                    expect(componentsMetaData.public.isContainable(mockPrivateServices, stripColumns, stripSlideshow)).toBe(true);
                });

                it('should return true if trying to insert new strip or columns to columns', function () {
                    var stripColumns = getCompPointer(mockPrivateServices, 'stripColumns', mainPagePointer);
                    expect(componentsMetaData.public.isContainable(mockPrivateServices, stripB, stripColumns)).toBe(true);
                    expect(componentsMetaData.public.isContainable(mockPrivateServices, stripColumns, stripColumns)).toBe(true);
                });

                it('should return true if trying to insert new strip or columns to old strip', function () {
                    var oldStrip = getCompPointer(mockPrivateServices, 'oldStrip', mainPagePointer);
                    var stripColumns = getCompPointer(mockPrivateServices, 'stripColumns', mainPagePointer);
                    expect(componentsMetaData.public.isContainable(mockPrivateServices, stripA, oldStrip)).toBe(true);
                    expect(componentsMetaData.public.isContainable(mockPrivateServices, stripColumns, oldStrip)).toBe(true);
                });

                it('should return false if trying to insert strip into dock horizontally to screen', function () {
                    var dockHorizontallyToScreenComp = someComponent;
                    dockHorizontallyToScreen(mockPrivateServices, dockHorizontallyToScreenComp);
                    expect(componentsMetaData.public.isContainable(mockPrivateServices, stripA, dockHorizontallyToScreenComp)).toBe(false);
                });

                it('should return true if trying to insert dock horizontally to screen comp into strip', function () {
                    var dockHorizontallyToScreenComp = someComponent;
                    dockHorizontallyToScreen(mockPrivateServices, dockHorizontallyToScreenComp);
                    expect(componentsMetaData.public.isContainable(mockPrivateServices, dockHorizontallyToScreenComp, stripB)).toBe(true);
                });

                it('should return true if trying to insert regular comp into strip', function () {
                    expect(componentsMetaData.public.isContainable(mockPrivateServices, someComponent, stripB)).toBe(true);
                });

                it('should return false if trying to insert hoverbox into hoverbox', function () {
                    expect(componentsMetaData.public.isContainable(mockPrivateServices, firstHoverbox, secondHoverbox)).toBe(false);
                });

                it('should return false if trying to insert a box with hoverbox inside, into a different hoverbox (deep check)', function () {
                    structure.setContainer(mockPrivateServices, null, firstHoverbox, container);

                    expect(componentsMetaData.public.isContainable(mockPrivateServices, container, secondHoverbox)).toBe(false);
                });

                it('should return false if trying to insert a container into a hoverbox', function(){
                    // TODO GuyR 16/08/2016 08:41 - when enabling this (container inside hoverbox), add a test that checks that you can't attach a hoverbox to a container that is already inside another hoverbox
                    // TODO GuyR 16/08/2016 10:32 - just uncomment the commented lines
                    expect(componentsMetaData.public.isContainable(mockPrivateServices, container, firstHoverbox)).toBe(false);

                    // structure.setContainer(mockPrivateServices, null, container, secondHoverbox);
                    //
                    // expect(componentsMetaData.public.isContainable(mockPrivateServices, firstHoverbox, container)).toBe(false);
                });

                describe('For horizontally dock to screen', function () {
                    var dockHorizontallyToScreenComp;
                    beforeEach(function () {
                        dockHorizontallyToScreenComp = someComponent;
                        dockHorizontallyToScreen(mockPrivateServices, dockHorizontallyToScreenComp);
                    });

                    it('isContainable should return false if parent is not page or master page', function () {
                        expect(componentsMetaData.public.isContainable(mockPrivateServices, dockHorizontallyToScreenComp, componentA)).toBe(false);
                    });

                    it('isContainable should return true if the parent is a page', function () {
                        expect(componentsMetaData.public.isContainable(mockPrivateServices, dockHorizontallyToScreenComp, mainPagePointer)).toBe(true);
                    });

                    it('isContainable should return true if the parent is master page', function () {
                        var materPage = mockPrivateServices.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);
                        expect(componentsMetaData.public.isContainable(mockPrivateServices, dockHorizontallyToScreenComp, materPage)).toBe(true);
                    });
                });
            });

            describe('isDisableable', function () {

                it('should return true if disableable is set to true in the metadata map', function () {
                    mockMetaData.componentA.disableable = true;
                    var isDisableable = componentsMetaData.public.isDisableable(mockPrivateServices, componentA);
                    expect(isDisableable).toBe(true);
                });

                it('should return false if disableable is set to false in the metadata map', function () {
                    mockMetaData.componentA.disableable = false;
                    var isDisableable = componentsMetaData.public.isDisableable(mockPrivateServices, componentA);
                    expect(isDisableable).toBe(false);
                });

                it('should return false if disableable is not set in the metadata map', function () {
                    delete mockMetaData.componentA.disableable;
                    var isDisableable = componentsMetaData.public.isDisableable(mockPrivateServices, componentA);
                    expect(isDisableable).toBe(false);
                });

            });

            describe('isHiddenable', function () {

                it('should return true if hiddenable is set to true in the metadata map', function () {
                    mockMetaData.componentA.hiddenable = true;
                    var isHiddenable = componentsMetaData.public.isHiddenable(mockPrivateServices, componentA);
                    expect(isHiddenable).toBe(true);
                });

                it('should return false if hiddenable is set to false in the metadata map', function () {
                    mockMetaData.componentA.hiddenable = false;
                    var isHiddenable = componentsMetaData.public.isHiddenable(mockPrivateServices, componentA);
                    expect(isHiddenable).toBe(false);
                });

                it('should return true if hiddenable is not set in the metadata map', function () {
                    delete mockMetaData.componentA.hiddenable;
                    var isHiddenable = componentsMetaData.public.isHiddenable(mockPrivateServices, componentA);
                    expect(isHiddenable).toBe(true);
                });

            });

            describe('isCollapsible', function () {

                it('should return false if collapseComponent experiment is close', function () {
                    testUtils.experimentHelper.closeExperiments('collapseComponent');

                    var isCollapsible = componentsMetaData.public.isCollapsible(mockPrivateServices, componentA);
                    expect(isCollapsible).toBe(false);
                });

                describe('collapseComponent experiment is open', function () {
                    beforeEach(function () {
                        testUtils.experimentHelper.openExperiments('collapseComponent');
                    });

                    it('should return true if collapsible is set to true in the metadata map', function () {
                        mockMetaData.componentA.collapsible = true;
                        var isCollapsible = componentsMetaData.public.isCollapsible(mockPrivateServices, componentA);
                        expect(isCollapsible).toBe(true);
                    });

                    it('should return false if collapsible is set to false in the metadata map', function () {
                        mockMetaData.componentA.collapsible = false;
                        var isCollapsible = componentsMetaData.public.isCollapsible(mockPrivateServices, componentA);
                        expect(isCollapsible).toBe(false);
                    });

                    it('should return true if collapsible is not set in the metadata map', function () {
                        delete mockMetaData.componentA.collapsible;
                        var isCollapsible = componentsMetaData.public.isCollapsible(mockPrivateServices, componentA);
                        expect(isCollapsible).toBe(true);
                    });
                });
            });

            describe('isDockable', function () {
                it('should return true if dockable is set to true in the metadata map', function () {
                    mockMetaData.componentA.dockable = true;
                    var isDockable = componentsMetaData.public.isDockable(mockPrivateServices, componentA);
                    expect(isDockable).toBe(true);
                });

                it('should return false if collapsible is set to false in the metadata map', function () {
                    mockMetaData.componentA.dockable = false;
                    var isDockable = componentsMetaData.public.isDockable(mockPrivateServices, componentA);
                    expect(isDockable).toBe(false);
                });

                it('should return true if collapsible is not set in the metadata map', function () {
                    delete mockMetaData.componentA.dockable;
                    var isDockable = componentsMetaData.public.isDockable(mockPrivateServices, componentA);
                    expect(isDockable).toBe(true);
                });
            });

            describe('isModal', function () {

                it('should return true if modal is set to true in the metadata map', function () {
                    mockMetaData.componentA.modal = true;
                    var modal = componentsMetaData.public.isModal(mockPrivateServices, componentA);
                    expect(modal).toBe(true);
                });

                it('should return false if modal is set to false in the metadata map', function () {
                    mockMetaData.componentA.modal = false;
                    var modal = componentsMetaData.public.isModal(mockPrivateServices, componentA);
                    expect(modal).toBe(false);
                });

                it('should return true if modal is not set in the metadata map', function () {
                    delete mockMetaData.componentA.modal;
                    var modal = componentsMetaData.public.isModal(mockPrivateServices, componentA);
                    expect(modal).toBe(false);
                });

            });

            describe('isAnchorableFrom', function () {
                it('should return true if anchors from comp is allowed in the anchors metadata map', function () {
                    var isAnchorableFrom = componentsMetaData.public.isAnchorableFrom(mockPrivateServices, siteSegmentContainer);
                    expect(isAnchorableFrom).toBeTruthy();
                });

                it('should return false if anchors from comp is not allowed in the anchors metadata map', function () {
                    var isAnchorableFrom = componentsMetaData.public.isAnchorableFrom(mockPrivateServices, controller);
                    expect(isAnchorableFrom).toBeFalsy();
                });
            });

            describe('isAnchorableTo', function () {
                it('should return true if anchors to comp is allowed in the anchors metadata map', function () {
                    var isAnchorableTo = componentsMetaData.public.isAnchorableTo(mockPrivateServices, siteSegmentContainer);
                    expect(isAnchorableTo).toBeTruthy();
                });

                it('should return false if anchors to comp is not allowed in the anchors metadata map', function () {
                    var isAnchorableTo = componentsMetaData.public.isAnchorableTo(mockPrivateServices, controller);
                    expect(isAnchorableTo).toBeFalsy();
                });
            });
        });
    });
});
