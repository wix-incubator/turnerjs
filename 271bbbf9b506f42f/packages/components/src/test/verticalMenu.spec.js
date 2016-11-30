define(['testUtils', 'core', 'utils', 'components/components/verticalMenu/verticalMenuDomBuilder', 'components/components/verticalMenu/verticalMenu'
], function (/** testUtils */ testUtils, core, utils, domBuilder, verticalMenuClass) {
    'use strict';

    describe('Vertical Menu Component', function () {

        var siteData, mockSiteMenu;

        var mockSkins = {
                mockSkinName: {
                    react: [
                        [
                            "ul",
                            "menuContainer",
                            [],
                            [
                                "li",
                                "menuItem",
                                [
                                    "_item"
                                ],
                                [
                                    "div",
                                    null,
                                    [
                                        "_itemContentWrapper"
                                    ],
                                    [
                                        "a",
                                        null,
                                        []
                                    ],
                                    [
                                        "ul",
                                        null,
                                        [
                                            "_subMenu"
                                        ]
                                    ]
                                ],
                                [
                                    "div",
                                    null,
                                    [
                                        "_separator"
                                    ]
                                ]
                            ]
                        ]
                    ]
                }
            },
            mockSkinParams = {
                brw: {
                    value: 1
                },
                separatorHeight: {
                    value: 10
                }
            },
            mockSkinStatics = {
                separatorNotIncludedInLineHeight: true,
                borderNotIncludedInLineHeight: true
            },
            mockSkinName = 'wysiwyg.common.components.verticalmenu.viewer.skins.VerticalMenuSeparatedButtonSkin';

        function mockGetParam(paramName) {
            return mockSkinParams[paramName];
        }

        function createVerticalMenuComponent() {
            var props = testUtils.mockFactory.mockProps(siteData).setCompProp({
                subMenuOpenSide: 'left',
                itemsAlignment: 'center'
            }).setNodeStyle({
                top: 100,
                height: 300
            }).setSkin(mockSkinName).setThemeStyle({
                style: {},
                id: 'mockStyleId'
            });
            props.currentUrlPageId = 'mockCurrentPage';
            props.structure.componentType = 'wysiwyg.common.components.verticalmenu.viewer.VerticalMenu';

            return testUtils.getComponentFromDefinition(verticalMenuClass, props);
        }

        function getMenuContainerProperty(vm, property) {
            return vm.getSkinProperties().menuContainer[property];
        }

        beforeEach(function () {
            siteData = testUtils.mockFactory.mockSiteData();

            mockSiteMenu = [
                siteData.mock.menuItemData({}),
                siteData.mock.menuItemData({})
            ];
        });

        beforeEach(function () {
            spyOn(utils.menuUtils, 'getSiteMenuWithRender').and.returnValue(mockSiteMenu);
            spyOn(domBuilder, 'getSkin').and.returnValue(mockSkins.mockSkinName);
            spyOn(core.compMixins.skinInfo, 'getParamFromDefaultSkin').and.callFake(mockGetParam);
            this.verticalMenu = createVerticalMenuComponent();
            spyOn(this.verticalMenu, 'getSkinExports').and.returnValue(mockSkinStatics);
        });

        it('should have siteMenu', function () {
            var calculated = getMenuContainerProperty(this.verticalMenu, 'data');
            expect(calculated).toEqual(mockSiteMenu);
        });

        it('should have skin', function () {
            var calculated = getMenuContainerProperty(this.verticalMenu, 'skin');
            expect(calculated).toEqual(mockSkinName);
        });

        it('should have classPrefix', function () {
            var calculated = getMenuContainerProperty(this.verticalMenu, 'classPrefix');
            expect(calculated).toEqual('mockStyleId');
        });

        it('should have currentPage', function () {
            var calculated = getMenuContainerProperty(this.verticalMenu, 'currentUrlPageId');
            expect(calculated).toEqual('mockCurrentPage');
        });

        it('should have currentPage', function () {
            var calculated = getMenuContainerProperty(this.verticalMenu, 'currentUrlPageId');
            expect(calculated).toEqual('mockCurrentPage');
        });

        describe('heights', function () {

            describe('line height when comp height is 300 and item count is 2', function () {

                var heights;

                it('separatorNotIncludedInLineHeight is "false" and borderNotIncludedInLineHeight is "false"', function () {
                    mockSkinStatics.separatorNotIncludedInLineHeight = false;
                    mockSkinStatics.borderNotIncludedInLineHeight = false;
                    heights = getMenuContainerProperty(this.verticalMenu, 'heights');

                    expect(heights.item).toEqual(145);
                    expect(heights.line).toEqual(147);
                    expect(heights.separator).toEqual(10);
                });

                it('separatorNotIncludedInLineHeight is "false" and borderNotIncludedInLineHeight is "true"', function () {
                    mockSkinStatics.separatorNotIncludedInLineHeight = false;
                    mockSkinStatics.borderNotIncludedInLineHeight = true;
                    heights = getMenuContainerProperty(this.verticalMenu, 'heights');

                    expect(heights.item).toEqual(150);
                    expect(heights.line).toEqual(150);
                    expect(heights.separator).toEqual(10);
                });

                it('separatorNotIncludedInLineHeight is "true" and borderNotIncludedInLineHeight is "false"', function () {
                    mockSkinStatics.separatorNotIncludedInLineHeight = true;
                    mockSkinStatics.borderNotIncludedInLineHeight = false;
                    heights = getMenuContainerProperty(this.verticalMenu, 'heights');

                    expect(heights.item).toEqual(144);
                    expect(heights.line).toEqual(136);
                    expect(heights.separator).toEqual(0);
                });

                it('separatorNotIncludedInLineHeight is "true" and borderNotIncludedInLineHeight is "true"', function () {
                    mockSkinStatics.separatorNotIncludedInLineHeight = true;
                    mockSkinStatics.borderNotIncludedInLineHeight = true;
                    heights = getMenuContainerProperty(this.verticalMenu, 'heights');

                    expect(heights.item).toEqual(149);
                    expect(heights.line).toEqual(139);
                    expect(heights.separator).toEqual(0);
                });

            });

        });

    });
});
