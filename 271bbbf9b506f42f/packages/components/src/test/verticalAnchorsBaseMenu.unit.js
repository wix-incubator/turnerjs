define(['lodash',
    'react',
    'testUtils',
    'utils',
    'color',
    'components/components/verticalAnchorsMenu/verticalAnchorsBaseMenu'], function
    (_, React, testUtils, utils, Color, verticalAnchorsBaseMenu) {
    'use strict';

    describe('VerticalAnchorsBaseMenu Component', function () {
        var reactTestUtils = React.addons.TestUtils;

        function getComponent(compDef, props) {
            return testUtils.getComponentFromDefinition(compDef, props);
        }

        beforeEach(function () {
            this.props = testUtils.mockFactory.mockProps();
            this.props.structure.componentType = 'wysiwyg.common.components.verticalanchorsmenu.viewer.VerticalAnchorsMenu';
        });

        describe('getMenuClasses should return correct menu classes', function () {
            beforeEach(function () {
                this.props.styleId = 's8';
            });

            it('Should return correct classes when itemsAlignment/orientation are set to `left`', function () {
                this.props.setCompProp({
                    itemsAlignment: 'left',
                    orientation: 'left'
                });
                var verticalAnchorsBaseMenuComp = getComponent(verticalAnchorsBaseMenu, this.props);
                expect(verticalAnchorsBaseMenuComp.getMenuClasses()).toEqual('s8_orientation-left s8_text-align-left');
            });

            it('Should return correct classes when itemsAlignment/orientation are set to `center`', function () {
                this.props.setCompProp({
                    itemsAlignment: 'center',
                    orientation: 'center'
                });
                var verticalAnchorsBaseMenuComp = getComponent(verticalAnchorsBaseMenu, this.props);
                expect(verticalAnchorsBaseMenuComp.getMenuClasses()).toEqual('s8_orientation-center s8_text-align-center');
            });

            it('Should return correct classes when itemsAlignment/orientation are set to `right`', function () {
                this.props.setCompProp({
                    itemsAlignment: 'right',
                    orientation: 'right'
                });
                var verticalAnchorsBaseMenuComp = getComponent(verticalAnchorsBaseMenu, this.props);
                expect(verticalAnchorsBaseMenuComp.getMenuClasses()).toEqual('s8_orientation-right s8_text-align-right');
            });
        });

        describe('getMenuButtons should create menu items', function () {
            var selectedId = 'selectedId';
            beforeEach(function () {
                this.props.styleId = 's8';
                this.props.isSelectedFn = function (id) {
                    return id === selectedId;
                };
                this.menuItems = [
                    {
                        id: 'selectedId'
                    },
                    {
                        id: 'a1'
                    },
                    {
                        id: 'a2'
                    }
                ];
            });
            it('Should create the correct number of menu buttons', function () {
                var verticalAnchorsBaseMenuComp = getComponent(verticalAnchorsBaseMenu, this.props);
                var menuButtons = verticalAnchorsBaseMenuComp.getMenuButtons(this.menuItems);
                expect(menuButtons.length).toEqual(3);
            });
            it('Should pass the correct props to the menu button', function () {
                var verticalAnchorsBaseMenuComp = getComponent(verticalAnchorsBaseMenu, this.props);
                var menuButtons = verticalAnchorsBaseMenuComp.getMenuButtons(this.menuItems);
                _.forEach(menuButtons, function (menuButton) {
                    var props = menuButton.props;
                    expect(props).toEqual(jasmine.objectContaining({
                        styleId: 's8',
                        anchorData: jasmine.any(Object),
                        svgShapeName: jasmine.any(String),
                        isActive: jasmine.any(Boolean),
                        siteData: jasmine.any(Object)
                    }));
                });
            });
            it('isActive should return true for the selected menu item and false otherwise', function () {
                var verticalAnchorsBaseMenuComp = getComponent(verticalAnchorsBaseMenu, this.props);
                var menuButtons = verticalAnchorsBaseMenuComp.getMenuButtons(this.menuItems);
                _.forEach(menuButtons, function (menuButton) {
                    if (menuButton.props.anchorData.id === selectedId) {
                        expect(menuButton.props.isActive).toBe(true);
                    } else {
                        expect(menuButton.props.isActive).toBe(false);
                    }
                });
            });

            describe('adjustment to background color', function () {
                beforeEach(function () {
                    this.backgroundBrightness = 10;
                    this.props.setCompProp({
                        autoColor: true
                    });

                    _.assign(this.props, {
                        menuItems: this.menuItems,
                        skin: 'wysiwyg.common.components.verticalanchorsmenu.viewer.skins.VerticalAnchorsMenuSymbolWithTextSkin'
                    });
                });

                describe('when diff between menu items color brightness and background color brightness is less than threshold', function () {
                    describe('when background brightness is less than 50 (dark)', function () {
                        beforeEach(function () {
                            this.backgroundBrightness = 15;
                            _.assign(this.props, {
                                overlappingBackgroundElementInfo: {brightness: this.backgroundBrightness}
                            });

                            this.selectedColor = new Color({
                                h: 0,
                                s: 0,
                                v: this.backgroundBrightness + utils.siteConstants.BRIGHTNESS_DIFF_THRESHOLD - 1
                            });
                            this.mainColor = new Color({
                                h: 0,
                                s: 0,
                                v: this.backgroundBrightness + utils.siteConstants.BRIGHTNESS_DIFF_THRESHOLD - 1
                            });
                            this.props.siteData.addGeneralTheme({
                                15: this.mainColor.rgbString(),
                                2: this.selectedColor.rgbString()
                            });
                        });

                        describe('when anchors menu is fixed position', function () {
                            beforeEach(function () {
                                this.props.setLayout({
                                    fixedPosition: true
                                });
                            });

                            it('should add a light class to the menu items', function () {
                                this.baseAnchorsMenu = getComponent(verticalAnchorsBaseMenu, this.props);
                                var lightMenuItems = reactTestUtils.scryRenderedDOMComponentsWithClass(this.baseAnchorsMenu, this.props.styleId + '_light');

                                expect(lightMenuItems.length).toEqual(this.menuItems.length);
                            });
                        });

                        describe('when anchors menu is not fixed position', function () {
                            beforeEach(function () {
                                this.props.setLayout({
                                    fixedPosition: false
                                });
                                this.baseAnchorsMenu = getComponent(verticalAnchorsBaseMenu, this.props);
                            });

                            it('should not add dark / light class to menu items', function () {
                                this.baseAnchorsMenu = getComponent(verticalAnchorsBaseMenu, this.props);
                                var lightMenuItems = reactTestUtils.scryRenderedDOMComponentsWithClass(this.baseAnchorsMenu, this.props.styleId + '_light');
                                var darkMenuItems = reactTestUtils.scryRenderedDOMComponentsWithClass(this.baseAnchorsMenu, this.props.styleId + '_dark');

                                expect(lightMenuItems.length).toEqual(0);
                                expect(darkMenuItems.length).toEqual(0);
                            });
                        });
                    });

                    describe('when background brightness is greater than 50 (light)', function () {
                        beforeEach(function () {
                            this.backgroundBrightness = 85;
                            _.assign(this.props, {
                                overlappingBackgroundElementInfo: {brightness: this.backgroundBrightness}
                            });

                            this.selectedColor = new Color({
                                h: 0,
                                s: 0,
                                v: this.backgroundBrightness - utils.siteConstants.BRIGHTNESS_DIFF_THRESHOLD + 1
                            });
                            this.mainColor = new Color({
                                h: 0,
                                s: 0,
                                v: this.backgroundBrightness - utils.siteConstants.BRIGHTNESS_DIFF_THRESHOLD + 1
                            });
                            this.props.siteData.addGeneralTheme({
                                15: this.mainColor.rgbString(),
                                2: this.selectedColor.rgbString()
                            });
                        });

                        describe('when anchors menu is fixed position', function () {
                            beforeEach(function () {
                                this.props.setLayout({
                                    fixedPosition: true
                                });
                            });

                            it('should add a dark class to the menu items', function () {
                                this.baseAnchorsMenu = getComponent(verticalAnchorsBaseMenu, this.props);
                                var darkMenuItems = reactTestUtils.scryRenderedDOMComponentsWithClass(this.baseAnchorsMenu, this.props.styleId + '_dark');

                                expect(darkMenuItems.length).toEqual(this.menuItems.length);
                            });
                        });
                    });
                });

                describe('when diff between menu items color brightness and background color brightness is greater than threshold', function () {
                    beforeEach(function () {
                        this.backgroundBrightness = 15;
                        _.assign(this.props, {
                            overlappingBackgroundElementInfo: {brightness: this.backgroundBrightness}
                        });

                        this.selectedColor = new Color({
                            h: 0,
                            s: 0,
                            v: this.backgroundBrightness + utils.siteConstants.BRIGHTNESS_DIFF_THRESHOLD + 1
                        });
                        this.mainColor = new Color({
                            h: 0,
                            s: 0,
                            v: this.backgroundBrightness + utils.siteConstants.BRIGHTNESS_DIFF_THRESHOLD + 1
                        });
                        this.props.siteData.addGeneralTheme({
                            15: this.mainColor.rgbString(),
                            2: this.selectedColor.rgbString()
                        });
                    });

                    describe('when anchors menu is fixed position', function(){
                        beforeEach(function () {
                            this.props.setLayout({
                                fixedPosition: true
                            });
                        });

                        it('should not add dark / light class to menu items', function () {
                            this.baseAnchorsMenu = getComponent(verticalAnchorsBaseMenu, this.props);
                            var lightMenuItems = reactTestUtils.scryRenderedDOMComponentsWithClass(this.baseAnchorsMenu, this.props.styleId + '_light');
                            var darkMenuItems = reactTestUtils.scryRenderedDOMComponentsWithClass(this.baseAnchorsMenu, this.props.styleId + '_dark');

                            expect(lightMenuItems.length).toEqual(0);
                            expect(darkMenuItems.length).toEqual(0);
                        });
                    });
                });
            });
        });
    });
});
