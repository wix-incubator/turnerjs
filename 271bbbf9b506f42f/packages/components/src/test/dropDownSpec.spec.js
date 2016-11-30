define([
    'lodash', 'definition!components/components/dropDownMenu/dropDownMenu', 'testUtils', 'skins', 'utils', 'zepto', 'siteUtils', 'components/components/menuButton/menuButton', 'react', 'reactDOM'
], function(_, dropDownMenuDef, /** testUtils */ testUtils, skinsPackage, utils, $, siteUtils, menuButton, React, ReactDOM) {
    'use strict';

    var defaultProps, myFakeCore, menuUtils;

    function getProperty(dropDownMenu, property) {
        return dropDownMenu.getSkinProperties()[property];
    }

    describe('dropDownMenu  Component', function () {
        beforeEach(function() {
            if (!defaultProps) {
                siteUtils.compFactory.register('core.components.MenuButton', menuButton);
                defaultProps = testUtils.mockFactory.mockProps()
                    .setCompData({
                        id: 'MAIN_MENU',
                        items: [
                            {"refId": "#mainPage", "items": [
                                {"refId": "#page", "items": []},
                                {"refId": "#popup", "items": []}
                            ]}
                        ]
                    }).setCompProp({
                        id: 'props',
                        alignText: "center",
                        alignButtons: "center",
                        moreButtonLabel: "moreMock",
                        sameWidthButtons: false,
                        stretchButtonsToMenuWidth: false
                    }).setThemeStyle({
                        id: 'mockStyle',
                        style: {properties: {}}
                    }).setNodeStyle({
                        height: 100
                    }).setSkin("wysiwyg.common.components.dropdownmenu.viewer.skins.RibbonsMenuButtonSkin");

                defaultProps.id = "hy6y3tx9";
                defaultProps.structure.componentType = 'wysiwyg.viewer.components.menus.DropDownMenu';

                defaultProps.siteData.addMeasureMap({
                    custom: {"hy6y3tx9menuItemContainerMargins": 0, "hy6y3tx9menuItemContainerExtraPixels": {"top": 5, "bottom": 5, "left": 5, "right": 5, "height": 10, "width": 10}, "hy6y3tx9needTopOpenMenuUp": false, "hy6y3tx9realWidths": [114, 302, 113, 115], "hy6y3tx9isMoreShown": false, "hy6y3tx9moreContainerBorderLeft": 5, "hy6y3xq5menuItemContainerMargins": 0, "hy6y3xq5menuItemContainerExtraPixels": {"top": 5, "bottom": 5, "left": 5, "right": 5, "height": 10, "width": 10}, "hy6y3xq5needTopOpenMenuUp": true, "hy6y3xq5realWidths": [116, 0, 0, 0, 109], "hy6y3xq5isMoreShown": true, "hy6y3xq5moreContainerBorderLeft": 5, "hy6y3y9umenuItemContainerMargins": 0, "hy6y3y9umenuItemContainerExtraPixels": {"top": 5, "bottom": 5, "left": 5, "right": 5, "height": 10, "width": 10}, "hy6y3y9uneedTopOpenMenuUp": true, "hy6y3y9urealWidths": [203, 0, 0, 0, 197], "hy6y3y9uisMoreShown": true, "hy6y3y9umoreContainerBorderLeft": 5, "hy6y4g9vmenuItemContainerMargins": 0, "hy6y4g9vmenuItemContainerExtraPixels": {"top": 5, "bottom": 5, "left": 5, "right": 5, "height": 10, "width": 10}, "hy6y4g9vneedTopOpenMenuUp": true, "hy6y4g9vrealWidths": [0, 0, 0, 0, 121], "hy6y4g9visMoreShown": true, "hy6y4g9vmoreContainerBorderLeft": 5, "hyej46rrmenuItemContainerMargins": 0, "hyej46rrmenuItemContainerExtraPixels": {"top": 5, "bottom": 5, "left": 5, "right": 5, "height": 10, "width": 10}, "hyej46rrneedTopOpenMenuUp": true, "hyej46rrrealWidths": [114, 302, 113, 115], "hyej46rrisMoreShown": false, "hyej46rrmoreContainerBorderLeft": 5, "SITE_BACKGROUND": {"structureMargin": 41, "documentHeight": 615}},
                    width: {"mainPage": 980, "mainPageinlineContent": 980, "hy6y3tx9": 644, "hy6y3tx9moreContainer": 10, "hy6y3tx9mainPage": 114, "hy6y3tx9cfvg": 302, "hy6y3tx9c1v82": 113, "hy6y3tx9cxkh": 115, "hy6y3tx9__more__": 0, "hy6y3xq5": 225, "hy6y3xq5moreContainer": 10, "hy6y3xq5mainPage": 116, "hy6y3xq5cfvg": 0, "hy6y3xq5c1v82": 0, "hy6y3xq5cxkh": 0, "hy6y3xq5__more__": 109, "hy6y3y9u": 400, "hy6y3y9umoreContainer": 10, "hy6y3y9umainPage": 203, "hy6y3y9ucfvg": 0, "hy6y3y9uc1v82": 0, "hy6y3y9ucxkh": 0, "hy6y3y9u__more__": 197, "hy6y4g9v": 121, "hy6y4g9vmoreContainer": 10, "hy6y4g9vmainPage": 0, "hy6y4g9vcfvg": 0, "hy6y4g9vc1v82": 0, "hy6y4g9vcxkh": 0, "hy6y4g9v__more__": 121, "hy6y5udk": 350, "hy6y6i2a": 350, "hy6y6rte": 350, "masterPage": 980, "SITE_FOOTER": 980, "SITE_FOOTERscreenWidthBackground": 1331, "SITE_FOOTERinlineContent": 980, "WRchTxt0-16wb": 400, "SITE_HEADER": 980, "SITE_HEADERscreenWidthBackground": 1331, "SITE_HEADERinlineContent": 980, "PAGES_CONTAINER": 980, "PAGES_CONTAINERscreenWidthBackground": 1331, "PAGES_CONTAINERinlineContent": 980, "SITE_PAGES": 980, "hyej46rr": 644, "hyej46rrmoreContainer": 10, "hyej46rrmainPage": 114, "hyej46rrcfvg": 302, "hyej46rrc1v82": 113, "hyej46rrcxkh": 115, "hyej46rr__more__": 0, "SITE_BACKGROUND": 1331, "SITE_BACKGROUNDbgBeforeTransition": 1331, "SITE_BACKGROUNDbgAfterTransition": 1331, "screen": 1331},
                    height: {"masterPage": 0}
                });
                defaultProps.siteData.mock.pageData({id: 'mainPage'});
                defaultProps.siteData.mock.pageData({id: 'page'});
                defaultProps.siteData.mock.pageData({id: 'popup-with-link'});
                defaultProps.siteData.mock.pageData({id: 'popup-without-link'});

                myFakeCore = testUtils.mockFactory.getFakeCoreWithRealSkinBased();
                menuUtils = utils.menuUtils;
            }
        });

        beforeEach(function () {
            spyOn(myFakeCore.compMixins.skinInfo, 'getParamFromDefaultSkin').and.returnValue(0);
            spyOn(myFakeCore.compMixins.skinInfo, 'getSumParamValue').and.returnValue(0);
            this.createCompDef = function () {
                this.compDef = dropDownMenuDef(_, ReactDOM, utils, myFakeCore, $);
            };
            this.getProps = function () {
                return defaultProps;
            };
        });

        describe('getSkinProperties', function () {
            function createMenuItem(id, label, link) {
                return {
                    id: 'dataItem-' + id,
                    isVisible:true,
                    isVisibleMobile:true,
                    items: [],
                    label: label || 'Some label',
                    link: link
                };
            }

            function createLink(pageId, isPopup) {
                return {
                    id: "dataItem-igamvdlr1",
                    pageId: {
                        id: pageId,
                        isPopup: isPopup
                    },
                    render: {
                        'data-anchor': "dataItem-iganjlyh1",
                        href: "href",
                        target: "_self"
                    },
                    type: "PageLink"
                };

            }

            function createPageMenuItem(id) {
                return createMenuItem(id, 'page-' + id, createLink(id, false));
            }

            function createPopupMenuItem(id) {
                return createMenuItem(id, 'page-' + id, createLink(id, true));
            }

            describe('selecting menu item', function () {
                beforeEach(function () {
                    this.createCompDef();
                    spyOn(menuUtils, "getSiteMenuWithRender").and.returnValue([
                        createPageMenuItem('page'),
                        createPopupMenuItem('popup-with-link')
                    ]);
                    spyOn(menuUtils, 'shouldHighlightAnchorInPage').and.returnValue(true);
                    this.createSelectionMap = function () {
                        var dropDownMenu = testUtils.getComponentFromDefinition(this.compDef, this.getProps());
                        var children = dropDownMenu.getSkinProperties().itemsContainer.children;

                        this.isSelectedMap = _(children).indexBy('props.menuBtnPageId').mapValues('props.isSelected').value();
                    };

                    this.isSelectedPageWithId = function (pageId) {
                        return this.isSelectedMap[pageId];
                    };
                });
                it('should select page if it is no popup', function () {
                    spyOn(defaultProps.siteData, 'getCurrentUrlPageId').and.returnValue('page');

                    this.createSelectionMap();
                    expect(this.isSelectedPageWithId('page')).toBe(true);
                    expect(this.isSelectedPageWithId('popup-with-link')).toBe(false);
                });
                it('should select popup if popup is open and menu has link on it', function () {
                    spyOn(defaultProps.siteData, 'getCurrentUrlPageId').and.returnValue('page');
                    spyOn(defaultProps.siteData, 'getCurrentPopupId').and.returnValue('popup-with-link');

                    this.createSelectionMap();
                    expect(this.isSelectedPageWithId('page')).toBe(false);
                    expect(this.isSelectedPageWithId('popup-with-link')).toBe(true);
                });
                it('should select page if popup is open but menu doesn\'t have link on it', function () {
                    spyOn(defaultProps.siteData, 'getCurrentUrlPageId').and.returnValue('page');
                    spyOn(defaultProps.siteData, 'getCurrentPopupId').and.returnValue('popup-without-link');

                    this.createSelectionMap();
                    expect(this.isSelectedPageWithId('page')).toBe(true);
                    expect(this.isSelectedPageWithId('popup-with-link')).toBe(false);
                });
            });
        });
    });

    xdescribe('dropDownMenu  Component', function () {

        beforeEach(function() {
          if (!defaultProps) {
            siteUtils.compFactory.register('core.components.MenuButton', menuButton);
            defaultProps = testUtils.mockFactory.mockProps()
            .setCompData({
              id: 'MAIN_MENU',
              items: [
              {"refId": "#mainPage", "items": [
              {"refId": "#cjg9", "items": []},
              {"refId": "#cee5", "items": []}
              ]},
              {"refId": "#c1v82", "items": []}
              ]
            }).setCompProp({
              id: 'props',
              alignText: "center",
              alignButtons: "center",
              moreButtonLabel: "moreMock",
              sameWidthButtons: false,
              stretchButtonsToMenuWidth: false
            }).setThemeStyle({
              id: 'mockStyle',
              style: {properties: {}}
            }).setNodeStyle({
              height: 100
            }).setSkin("wysiwyg.common.components.dropdownmenu.viewer.skins.RibbonsMenuButtonSkin");

            defaultProps.id = "hy6y3tx9";

            defaultProps.siteData.addMeasureMap({
              custom: {"hy6y3tx9menuItemContainerMargins": 0, "hy6y3tx9menuItemContainerExtraPixels": {"top": 5, "bottom": 5, "left": 5, "right": 5, "height": 10, "width": 10}, "hy6y3tx9needTopOpenMenuUp": false, "hy6y3tx9realWidths": [114, 302, 113, 115], "hy6y3tx9isMoreShown": false, "hy6y3tx9moreContainerBorderLeft": 5, "hy6y3xq5menuItemContainerMargins": 0, "hy6y3xq5menuItemContainerExtraPixels": {"top": 5, "bottom": 5, "left": 5, "right": 5, "height": 10, "width": 10}, "hy6y3xq5needTopOpenMenuUp": true, "hy6y3xq5realWidths": [116, 0, 0, 0, 109], "hy6y3xq5isMoreShown": true, "hy6y3xq5moreContainerBorderLeft": 5, "hy6y3y9umenuItemContainerMargins": 0, "hy6y3y9umenuItemContainerExtraPixels": {"top": 5, "bottom": 5, "left": 5, "right": 5, "height": 10, "width": 10}, "hy6y3y9uneedTopOpenMenuUp": true, "hy6y3y9urealWidths": [203, 0, 0, 0, 197], "hy6y3y9uisMoreShown": true, "hy6y3y9umoreContainerBorderLeft": 5, "hy6y4g9vmenuItemContainerMargins": 0, "hy6y4g9vmenuItemContainerExtraPixels": {"top": 5, "bottom": 5, "left": 5, "right": 5, "height": 10, "width": 10}, "hy6y4g9vneedTopOpenMenuUp": true, "hy6y4g9vrealWidths": [0, 0, 0, 0, 121], "hy6y4g9visMoreShown": true, "hy6y4g9vmoreContainerBorderLeft": 5, "hyej46rrmenuItemContainerMargins": 0, "hyej46rrmenuItemContainerExtraPixels": {"top": 5, "bottom": 5, "left": 5, "right": 5, "height": 10, "width": 10}, "hyej46rrneedTopOpenMenuUp": true, "hyej46rrrealWidths": [114, 302, 113, 115], "hyej46rrisMoreShown": false, "hyej46rrmoreContainerBorderLeft": 5, "SITE_BACKGROUND": {"structureMargin": 41, "documentHeight": 615}},
              width: {"mainPage": 980, "mainPageinlineContent": 980, "hy6y3tx9": 644, "hy6y3tx9moreContainer": 10, "hy6y3tx9mainPage": 114, "hy6y3tx9cfvg": 302, "hy6y3tx9c1v82": 113, "hy6y3tx9cxkh": 115, "hy6y3tx9__more__": 0, "hy6y3xq5": 225, "hy6y3xq5moreContainer": 10, "hy6y3xq5mainPage": 116, "hy6y3xq5cfvg": 0, "hy6y3xq5c1v82": 0, "hy6y3xq5cxkh": 0, "hy6y3xq5__more__": 109, "hy6y3y9u": 400, "hy6y3y9umoreContainer": 10, "hy6y3y9umainPage": 203, "hy6y3y9ucfvg": 0, "hy6y3y9uc1v82": 0, "hy6y3y9ucxkh": 0, "hy6y3y9u__more__": 197, "hy6y4g9v": 121, "hy6y4g9vmoreContainer": 10, "hy6y4g9vmainPage": 0, "hy6y4g9vcfvg": 0, "hy6y4g9vc1v82": 0, "hy6y4g9vcxkh": 0, "hy6y4g9v__more__": 121, "hy6y5udk": 350, "hy6y6i2a": 350, "hy6y6rte": 350, "masterPage": 980, "SITE_FOOTER": 980, "SITE_FOOTERscreenWidthBackground": 1331, "SITE_FOOTERinlineContent": 980, "WRchTxt0-16wb": 400, "SITE_HEADER": 980, "SITE_HEADERscreenWidthBackground": 1331, "SITE_HEADERinlineContent": 980, "PAGES_CONTAINER": 980, "PAGES_CONTAINERscreenWidthBackground": 1331, "PAGES_CONTAINERinlineContent": 980, "SITE_PAGES": 980, "hyej46rr": 644, "hyej46rrmoreContainer": 10, "hyej46rrmainPage": 114, "hyej46rrcfvg": 302, "hyej46rrc1v82": 113, "hyej46rrcxkh": 115, "hyej46rr__more__": 0, "SITE_BACKGROUND": 1331, "SITE_BACKGROUNDbgBeforeTransition": 1331, "SITE_BACKGROUNDbgAfterTransition": 1331, "screen": 1331},
                height: {"masterPage": 0}
            });
            defaultProps.siteData.mock.pageData({id: 'mainPage'});
            defaultProps.siteData.mock.pageData({id: 'cfvg'});
            defaultProps.siteData.mock.pageData({id: 'c1v82'});
            defaultProps.siteData.mock.pageData({id: 'cjg9'});
            defaultProps.siteData.mock.pageData({id: 'cee5'});

            myFakeCore = testUtils.mockFactory.getFakeCoreWithRealSkinBased();
            menuUtils = utils.menuUtils;
          }
        });

        beforeEach(function () {
            spyOn(myFakeCore.compMixins.skinInfo, 'getParamFromDefaultSkin').and.returnValue(0);
            spyOn(myFakeCore.compMixins.skinInfo, 'getSumParamValue').and.returnValue(0);
            this.compDef = dropDownMenuDef(_, ReactDOM, skinsPackage, utils, myFakeCore, $, true);
            this.getProps = function () {
                return defaultProps;
            };
            spyOn(menuUtils, "getSiteMenuWithRender").and.callFake(function () {
                return [
                    {"label": "strech", "isVisible": true, "isVisibleMobile": true, "items": [
                        {"label": "Page 2", "isVisible": true, "isVisibleMobile": true, "items": [], "link": {"type": "PageLink", "pageId": "#cjg9", "render": {"href": "http://localhost/sites/menuSite?debug=all#!page2/cjg9", "target": "_self"}}},
                        {"label": "Page 3", "isVisible": true, "isVisibleMobile": true, "items": [], "link": {"type": "PageLink", "pageId": "#cee5", "render": {"href": "http://localhost/sites/menuSite?debug=all#!page3/cee5", "target": "_self"}}}
                    ], "link": {"type": "PageLink", "pageId": "#mainPage", "render": {"href": "http://localhost/sites/menuSite?debug=all", "target": "_self"}}},
                    {"label": "Same Width Same Width Same Width", "isVisible": true, "isVisibleMobile": true, "items": [
                        {"label": "Contact", "isVisible": true, "isVisibleMobile": true, "items": [], "link": {"type": "PageLink", "pageId": "#c24vq", "render": {"href": "http://localhost/sites/menuSite?debug=all#!form__map/c24vq", "target": "_self"}}},
                        {"label": "About1", "isVisible": true, "isVisibleMobile": true, "items": [], "link": {"type": "PageLink", "pageId": "#cy92", "render": {"href": "http://localhost/sites/menuSite?debug=all#!about1/cy92", "target": "_self"}}}
                    ], "link": {"type": "PageLink", "pageId": "#cfvg", "render": {"href": "http://localhost/sites/menuSite?debug=all#!page4/cfvg", "target": "_self"}}},
                    {"label": "Same Width anchor", "isVisible": true, "isVisibleMobile": true, "items": [], "link": {"type": "AnchorLink", "anchorDataId": "#rtgf", "pageId": "#cy92", "render": {"href": "http://localhost/sites/menuSite?debug=all#!about1/cy92", "target": "_self"}}},
                    {"label": "BOTH", "isVisible": true, "isVisibleMobile": true, "items": [], "link": {"type": "PageLink", "pageId": "#c1v82", "render": {"href": "http://localhost/sites/menuSite?debug=all#!about1/c1v82", "target": "_self"}}},
                    {"label": "NONE", "isVisible": true, "isVisibleMobile": true, "items": [], "link": {"type": "PageLink", "pageId": "#cxkh", "render": {"href": "http://localhost/sites/menuSite?debug=all#!about1/cxkh", "target": "_self"}}},
                    {"label": "AnchorInPageNONE", "isVisible": true, "isVisibleMobile": true, "items": [], "link": {"type": "AnchorLink", "anchorDataId": "#wert", "pageId": "#cxkh", "render": {"href": "http://localhost/sites/menuSite?debug=all#!about1/cxkh", "target": "_self"}}},
                    {"label": "ANchorBlaBla", "isVisible": true, "isVisibleMobile": true, "items": [], "link": {"type": "AnchorLink", "anchorDataId": "#sdfg", "pageId": "#cxkh", "render": {"href": "http://localhost/sites/menuSite?debug=all#!about1/cxkh", "target": "_self"}}}
                ];
            });
        });

        describe('dropDownMenu Initial State', function () {
            it('get Initial state return values based on defaults', function () {

                var dropDownMenu = testUtils.getComponentFromDefinition(this.compDef, this.getProps());
                var initialState = dropDownMenu.getInitialState();
                expect(initialState.hover).toEqual(null);
                expect(initialState.hoverListPosition).toEqual(null);
                expect(initialState.$dropAlign).toEqual("center");

            });
        });

        describe('dropDownMenu getParamsFromSkins', function () {
            it('get Default Params from skins', function () {

                var dropDownMenu = testUtils.getComponentFromDefinition(this.compDef, this.getProps());
                var paramsFromSkin = dropDownMenu.getParamsFromSkins();
                expect(paramsFromSkin.menuBorderY).toEqual(0);
                expect(paramsFromSkin.menuBtnBorder).toEqual(0);
                expect(paramsFromSkin.ribbonEls).toEqual(0);
                expect(paramsFromSkin.labelPad).toEqual(0);
                expect(paramsFromSkin.ribbonExtra).toEqual(10);

            });
        });

        describe('dropDownMenu mouse events', function () {
            it('mouseEnterHandler - hover regular menu Btn - update state', function () {
                var dropDownMenu = testUtils.getComponentFromDefinition(this.compDef, this.getProps());
                var childId = "0";
                var hoverListPosition = "center";
                spyOn(menuUtils, 'nonHiddenPageIdsFromMainMenu').and.callFake(function () {
                    return ["0", "1", "2", "3", "__more__"];
                });
                dropDownMenu.mouseEnterHandler(childId, hoverListPosition);
                expect(dropDownMenu.state.hover).toEqual(childId);
                expect(dropDownMenu.state.hoverListPosition).toEqual(hoverListPosition);

            });

            it('mouseEnterHandler - hover more Btn - update state', function () {
                var dropDownMenu = testUtils.getComponentFromDefinition(this.compDef, this.getProps());

                var childId = "__more__";
                var hoverListPosition = "center";
                spyOn(menuUtils, 'nonHiddenPageIdsFromMainMenu').and.callFake(function () {
                    return ["0", "1", "2", "3", "__more__"];
                });
                dropDownMenu.mouseEnterHandler(childId, hoverListPosition);
                expect(dropDownMenu.state.hover).toEqual(childId);
                expect(dropDownMenu.state.hoverListPosition).toEqual(hoverListPosition);

            });

            it('mouseEnterHandler - hover menuBtn and after on more Btn - clearFirstMenuButtonState', function () {

                spyOn(menuUtils, 'nonHiddenPageIdsFromMainMenu').and.callFake(function () {
                    return ["0", "1", "2", "3", "__more__"];
                });

                var dropDownMenu = testUtils.getComponentFromDefinition(this.compDef, this.getProps());
                spyOn(dropDownMenu, 'setState').and.callFake(function (newState) {
                    _.assign(dropDownMenu.state, newState);
                });
                var childId = "0";
                var hoverListPosition = "center";
                dropDownMenu.mouseEnterHandler(childId, hoverListPosition);
                expect(dropDownMenu.state.hover).toEqual(childId);
                expect(dropDownMenu.state.hoverListPosition).toEqual(hoverListPosition);
                childId = "__more__";
                hoverListPosition = "center";
                dropDownMenu.mouseEnterHandler(childId, hoverListPosition);
                expect(dropDownMenu.state.hover).toEqual(childId);
                expect(dropDownMenu.state.hoverListPosition).toEqual(hoverListPosition);

            });

            it('mouseLeaveHandler - clear the state after 1 sec', function () {
                spyOn(menuUtils, 'nonHiddenPageIdsFromMainMenu').and.callFake(function () {
                    return ["0", "1", "2", "3", "__more__"];
                });

                jasmine.clock().install();
                var dropDownMenu = testUtils.getComponentFromDefinition(this.compDef, this.getProps());
                //spyOn(Date, 'now').and.returnValue(1387636363717);

                var firstCall = 0;
                spyOn(dropDownMenu, 'getCurrentTime').and.callFake(function () {
                    var firstTime = 1387636363717;
                    if (firstCall < 2) {
                        firstCall++;
                        return firstTime;
                    }
                    return 1500000000000;


                });
                spyOn(dropDownMenu, 'setTimeout').and.callFake(function (callback) {
                    setTimeout(function () {
                        callback();
                    }, 10);
                });
                var childId = "mainPage";
                var hoverListPosition = "center";
                dropDownMenu.mouseEnterHandler(childId, hoverListPosition);
                dropDownMenu.mouseLeaveHandler();
                jasmine.clock().tick(5000);
                expect(dropDownMenu.state.hover).toEqual(null);
                expect(dropDownMenu.state.hoverListPosition).toEqual(null);
                jasmine.clock().uninstall();

            });

            it('mouseLeaveHandler - if hover less then 1 sec - state will remain the same', function () {
                jasmine.clock().install();
                spyOn(menuUtils, 'nonHiddenPageIdsFromMainMenu').and.callFake(function () {
                    return ["0", "1", "2", "3", "__more__"];
                });


                var dropDownMenu = testUtils.getComponentFromDefinition(this.compDef, this.getProps());
                spyOn(dropDownMenu, 'setState').and.callFake(function (newState) {
                    _.assign(dropDownMenu.state, newState);
                });
                spyOn(dropDownMenu, 'setTimeout').and.callFake(function (callback) {
                    setTimeout(function () {
                        callback();
                    }, 10);
                });
                var childId = "0";
                var hoverListPosition = "center";
                dropDownMenu.mouseEnterHandler(childId, hoverListPosition);
                dropDownMenu.mouseLeaveHandler();
                jasmine.clock().tick(100);
                expect(dropDownMenu.state.hover).toEqual(childId);
                expect(dropDownMenu.state.hoverListPosition).toEqual(hoverListPosition);
                jasmine.clock().uninstall();

            });

            describe('mouse click on mobile or tablet (desktop view)', function () {

                var dropDownMenu, menuBtn, menuButtonDomNode;

                beforeEach(function() {
                    dropDownMenu = testUtils.getComponentFromDefinition(this.compDef, this.getProps());
                    menuBtn = dropDownMenu.refs['0'];
                    dropDownMenu.props.siteData._isTabletDevice = true;
                    dropDownMenu.state.$mobile = 'mobile';
                    menuBtn.state.$mobile = 'mobile';
                    menuButtonDomNode = ReactDOM.findDOMNode(menuBtn);
                });

                it('should do nothing if the menu item has no children (dropdown)', function() {
                    var noChildrenMenuBtn = dropDownMenu.refs[2];
                    menuButtonDomNode = ReactDOM.findDOMNode(noChildrenMenuBtn);
                    var spyOnMouseEnter = spyOn(dropDownMenu, 'mouseEnterHandler');
                    var spyOnMouseLeave = spyOn(dropDownMenu, 'mouseLeaveHandler');
                    React.addons.TestUtils.Simulate.click(menuButtonDomNode);
                    expect(spyOnMouseEnter).not.toHaveBeenCalled();
                    expect(spyOnMouseLeave).not.toHaveBeenCalled();
                });

                it('should open dropdown using mouseEnterHandler when a menu button item is clicked for the first time', function () {
                    var spyOnMouseEnter = spyOn(dropDownMenu, 'mouseEnterHandler');
                    React.addons.TestUtils.Simulate.click(menuButtonDomNode);
                    expect(spyOnMouseEnter).toHaveBeenCalled();
                });

                it('should close dropdown using mouseLeaveHandler when a menu button is clicked for the second time', function() {
                    dropDownMenu.dropDownOpen = true;
                    var spyOnMouseLeave = spyOn(dropDownMenu, 'mouseLeaveHandler');
                    React.addons.TestUtils.Simulate.click(menuButtonDomNode);
                    expect(spyOnMouseLeave).toHaveBeenCalled();
                });

            });

        });

        describe('dropDownMenu menuBtn Creation', function () {
            it('createMoreButton - create new menu Btn constructor', function () {
                var dropDownMenu = testUtils.getComponentFromDefinition(this.compDef, this.getProps());

                var paramsFromSkin = {menuBorderY: 10, menuBtnBorder: 0, ribbonEls: 0, labelPad: 0, ribbonExtra: 0};
                var moreBtn = dropDownMenu.createMoreButton(paramsFromSkin);
                expect(moreBtn).toBeDefined();
            });

            it('should create more button in the left rtl is true', function() {
                var props = this.getProps();
                props.compProp.stretchButtonsToMenuWidth = true;
                var dropDownMenu = testUtils.getComponentFromDefinition(this.compDef, props);

                var paramsFromSkin = {menuBorderY: 10, menuBtnBorder: 0, ribbonEls: 0, labelPad: 0, ribbonExtra: 0};
                var moreBtn = dropDownMenu.createMoreButton(paramsFromSkin, true);
                expect(moreBtn.props.positionInList).toBe('left');
            });

            it('should create more button in the right rtl is false', function() {
                var props = this.getProps();
                props.compProp.stretchButtonsToMenuWidth = true;
                var dropDownMenu = testUtils.getComponentFromDefinition(this.compDef, props);

                var paramsFromSkin = {menuBorderY: 10, menuBtnBorder: 0, ribbonEls: 0, labelPad: 0, ribbonExtra: 0};
                var moreBtn = dropDownMenu.createMoreButton(paramsFromSkin);
                expect(moreBtn.props.positionInList).toBe('right');
            });

            it('convertItemsToChildren - creates Array of all menu buttons', function () {

                var compData = menuUtils.getSiteMenuWithRender();
                var dropDownMenu = testUtils.getComponentFromDefinition(this.compDef, this.getProps());
                var paramsFromSkin = {menuBorderY: 10, menuBtnBorder: 0, ribbonEls: 0, labelPad: 0, ribbonExtra: 0};
                var menuBtns = dropDownMenu.convertItemsToChildren(compData, {display: "inherit"}, null, null, paramsFromSkin);
                expect(menuBtns).toBeDefined();
                expect(menuBtns.length).toEqual(7);

            });
        });

        describe('dropDownMenu Anchor Selection', function () {
            var compData;
            var compProps;
            var dropDownMenu;
            var paramsFromSkin;

            beforeEach(function () {
                compData = menuUtils.getSiteMenuWithRender();
                compProps = this.getProps();
                spyOn(utils.scrollAnchors, 'getActiveAnchor').and.returnValue({activeAnchorComp: {id: 'wert'}});
                dropDownMenu = testUtils.getComponentFromDefinition(this.compDef, compProps);
                paramsFromSkin = {};
            });

            it('should set an anchor button to selected', function () {
                var menuBtns = dropDownMenu.convertItemsToChildren(compData, {display: "inherit"}, null, null, paramsFromSkin);
                var shouldBeActiveAnchor = _.find(menuBtns, 'props.compData.link.anchorDataId.id', '#wert');

                expect(shouldBeActiveAnchor.props.isSelected).toBeTruthy();
            });

            it('should set an anchor button to selected', function () {
                var menuBtns = dropDownMenu.convertItemsToChildren(compData, {display: "inherit"}, null, null, paramsFromSkin);
                var shouldBeActiveAnchor = _.find(menuBtns, function (item) {return item.props.compData.link.anchorDataId !== '#wert';});

                expect(shouldBeActiveAnchor.props.isSelected).toBeFalsy();
            });

            it('should not select an anchor if scrollAnchorsUtils.getActiveAnchor return null', function () {
                utils.scrollAnchors.getActiveAnchor.and.returnValue(null);

                var menuBtns = dropDownMenu.convertItemsToChildren(compData, {display: "inherit"}, null, null, paramsFromSkin);
                var shouldBeActiveAnchor = _.find(menuBtns, 'props.compData.link.anchorDataId', '#wert');

                expect(shouldBeActiveAnchor.props.isSelected).toBeFalsy();
            });
        });

        describe('dropDownMenu getSkin Properties', function () {
            it('get Skin properties - dropWrapper skinPart not hover', function () {

                spyOn(menuUtils, 'nonHiddenPageIdsFromMainMenu').and.callFake(function () {
                    return ["0", "1", "2", "3", "__more__"];
                });
                var dropDownMenu = testUtils.getComponentFromDefinition(this.compDef, this.getProps());
                var dropWrapperSkinPart = getProperty(dropDownMenu, "dropWrapper");
                expect(dropWrapperSkinPart.style.visibility).toEqual("hidden");
                expect(dropWrapperSkinPart["data-drophposition"]).toEqual("");
                expect(dropWrapperSkinPart["data-dropalign"]).toEqual("center");
            });

            it('get Skin properties - dropWrapper skinPart  hover', function () {
                spyOn(menuUtils, 'nonHiddenPageIdsFromMainMenu').and.callFake(function () {
                    return ["0", "1", "2", "3", "__more__"];
                });

                var dropDownMenu = testUtils.getComponentFromDefinition(this.compDef, this.getProps());
                var childId = "0";
                var hoverListPosition = "center";
                dropDownMenu.mouseEnterHandler(childId, hoverListPosition);
                var dropWrapperSkinPart = getProperty(dropDownMenu, "dropWrapper");
                expect(dropWrapperSkinPart.style.visibility).toEqual("inherit");
                expect(dropWrapperSkinPart["data-drophposition"]).toEqual("center");
                expect(dropWrapperSkinPart["data-dropalign"]).toEqual("center");
            });

            it('get Skin properties - moreContainer SkinPart not hover', function () {
                spyOn(menuUtils, 'nonHiddenPageIdsFromMainMenu').and.callFake(function () {
                    return ["0", "1", "2", "3", "__more__"];
                });

                var dropDownMenu = testUtils.getComponentFromDefinition(this.compDef, this.getProps());
                var moreContainerSkinPart = getProperty(dropDownMenu, "moreContainer");
                expect(moreContainerSkinPart.style.visibility).toEqual("hidden");
                expect(moreContainerSkinPart["data-hover"]).toEqual(null);
                expect(moreContainerSkinPart.children.length).toEqual(0);
            });

            it('get Skin properties - moreContainer SkinPart hover', function () {
                spyOn(menuUtils, 'nonHiddenPageIdsFromMainMenu').and.callFake(function () {
                    return ["0", "1", "2", "3", "__more__"];
                });

                var dropDownMenu = testUtils.getComponentFromDefinition(this.compDef, this.getProps());
                var childId = "0";
                var hoverListPosition = "center";
                dropDownMenu.mouseEnterHandler(childId, hoverListPosition);
                var moreContainerSkinPart = getProperty(dropDownMenu, "moreContainer");
                expect(moreContainerSkinPart.style.visibility).toEqual("inherit");
                expect(moreContainerSkinPart["data-hover"]).toEqual("0");
                expect(moreContainerSkinPart.children.length).toEqual(2);
            });

            it('get Skin properties - back SkinPart not hover', function () {
                spyOn(menuUtils, 'nonHiddenPageIdsFromMainMenu').and.callFake(function () {
                    return ["0", "1", "2", "3", "__more__"];
                });

                var dropDownMenu = testUtils.getComponentFromDefinition(this.compDef, this.getProps());
                spyOn(dropDownMenu, 'getParamsFromSkins').and.callFake(function () {
                    return {menuBorderY: 10, menuBtnBorder: 0, ribbonEls: 0, labelPad: 0, ribbonExtra: 0};
                });

                var dropWrapperSkinPart = getProperty(dropDownMenu, "back");
                expect(dropWrapperSkinPart.style.height).toEqual(90);
            });

            it('get Skin properties - itemContainer SkinPart not hover', function () {
                spyOn(menuUtils, 'nonHiddenPageIdsFromMainMenu').and.callFake(function () {
                    return ["0", "1", "2", "3", "__more__"];
                });

                var dropDownMenu = testUtils.getComponentFromDefinition(this.compDef, this.getProps());
                var backSkinPart = getProperty(dropDownMenu, "itemsContainer");
                expect(backSkinPart.style.height).toEqual(90);
                expect(backSkinPart.style.display).toEqual("inline-block");
                expect(backSkinPart.style.textAlign).toEqual("center");
                expect(backSkinPart.children.length).toEqual(8);
            });

            it('get Skin properties - itemsContainer should have the menu in the correct pages order given RTL false', function () {
                var props = this.getProps();
                props.compProp.rtl = false;
                var dropDownMenu = testUtils.getComponentFromDefinition(this.compDef, props);
                var itemsContainer = getProperty(dropDownMenu, "itemsContainer");

                var firstMenuItem = itemsContainer.children[0];
                expect(firstMenuItem.props.compData.id).not.toBe('__more__');
            });

            it('get Skin properties - itemsContainer should have the menu in the reverse pages order if RTL is true', function () {
                var props = this.getProps();
                props.compProp.rtl = true;
                var dropDownMenu = testUtils.getComponentFromDefinition(this.compDef, props);
                var itemsContainer = getProperty(dropDownMenu, "itemsContainer");

                var firstMenuItem = itemsContainer.children[0];
                expect(firstMenuItem.props.compData.id).toBe('__more__');
            });

            it('get Skin properties - componet skin properties', function () {
                spyOn(menuUtils, 'nonHiddenPageIdsFromMainMenu').and.callFake(function () {
                    return ["0", "1", "2", "3", "__more__"];
                });

                var dropDownMenu = testUtils.getComponentFromDefinition(this.compDef, this.getProps());
                var SkinPart = getProperty(dropDownMenu, "");
                expect(SkinPart.id).toEqual(defaultProps.id);
                expect(SkinPart.key).toEqual(defaultProps.key);

            });
        });
    });
});
