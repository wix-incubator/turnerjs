define([
    'lodash',
    'testUtils',
    'documentServices/theme/theme',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/mobileConversion/modules/mobileOnlyComponentsHandler'
], function (
    _,
    testUtils,
    theme,
    privateServicesHelper,
    mobileOnlyComponentsHandler
    ){
    'use strict';

    describe('mobile only components handler', function(){

        function mockStructure(withMobileComps){
            var tinyMenu = {
                componentType: 'wysiwyg.viewer.components.mobile.TinyMenu',
                type: 'Component',
                id: 'TINY_MENU'
            };

            var exitMobile = {
                componentType: 'wysiwyg.common.components.exitmobilemode.viewer.ExitMobileMode',
                type: 'Component',
                id: 'EXIT_MOBILE'
            };

            var backToTop = {
                componentType: 'wysiwyg.common.components.backtotopbutton.viewer.BackToTopButton',
                type: 'Component',
                id: 'BACK_TO_TOP_BUTTON'
            };

            var otherComps = [
                {
                    componentType: 'wysiwyg.viewer.components.WRichText',
                    type: 'Component',
                    id: 'WRchTxt2-sx1'
                },

                {
                    componentType: 'wysiwyg.viewer.components.WRichText',
                    type: 'Component',
                    id: 'WRchTxt0-14mc'
                }
            ];

            return {
                type: 'Document',

                children: [
                    {
                        id: 'SITE_HEADER',
                        type: 'Container',
                        componentType: 'wysiwyg.viewer.components.HeaderContainer',

                        components: withMobileComps ? [tinyMenu] : []
                    },

                    {
                        componentType: 'wysiwyg.viewer.components.PagesContainer',
                        type: 'Container',
                        id: 'PAGES_CONTAINER',

                        components: []
                    },

                    {
                        componentType: 'wysiwyg.viewer.components.FooterContainer',
                        type: 'Container',
                        id: 'SITE_FOOTER',

                        components: withMobileComps ? otherComps.concat(backToTop, exitMobile) : otherComps
                    }
                ]
            };
        }

        describe('Tiny menu', function() {
            describe('Add to structure', function() {
                var structure;
                beforeEach(function() {
                    structure = _.cloneDeep({
                        components: [
                            {
                                id: 'SITE_HEADER',
                                conversionData: {minHeight: 100},
                                layout: {x: 0, y: 0, width: 320, height: 100},
                                components: []
                            }
                        ]
                    });
                });
                it('should be added to the header', function() {
                    mobileOnlyComponentsHandler.addMobileOnlyComponentsOnConversion(structure);
                    var header = structure.components[0];
                    var menu = header.components[0];
                    expect(menu.id).toEqual("TINY_MENU");
                    expect(menu.styleId).toEqual("tmFull1");
                    expect(menu.layout.x).toEqual(250);
                    expect(menu.layout.y).toEqual(20);
                    expect(header.layout.height).toEqual(100);
                });

                it('should have the correct style by the header color', function() {
                    structure.components[0].conversionData.backgroundColor = 'color_18';
                    mobileOnlyComponentsHandler.addMobileOnlyComponentsOnConversion(structure);
                    var header = structure.components[0];
                    var menu = header.components[0];
                    expect(menu.id).toEqual("TINY_MENU");
                    expect(menu.styleId).toEqual("tmFull2");
                });
            });

            describe('Additional styles', function() {
                var ps;
                beforeEach(function () {
                    ps = privateServicesHelper.mockPrivateServicesWithRealDAL(testUtils.mockFactory.mockSiteData());
                });

                it('should be created if they don`t already exist', function() {
                    mobileOnlyComponentsHandler.createAdditionalStylesIfNeeded(ps, null);
                    var tm1Style = theme.styles.get(ps, 'tm2');
                    expect(tm1Style.id).toEqual('tm2');
                });
                it('should not be created if they don`t already exist', function() {
                    theme.styles.createItem(ps,
                        {id: 'tm2', styleType: 'system', metaData: {isPreset: false, isHidden: false}, skin: 'wysiwyg.viewer.skins.mobile.TinyMenuFullScreenSkin', type: 'TopLevelStyle', style: {properties: {bg: 'color_33'}}},
                        'tm2');
                    mobileOnlyComponentsHandler.createAdditionalStylesIfNeeded(ps, null);
                    var tm1Style = theme.styles.get(ps, 'tm2');
                    expect(tm1Style.style.properties.bg).toEqual('color_33');
                });
            });
        });

        describe('getting the mobile only hidden components ids', function(){
            it('should not get anything if mobile only components are not hidden', function(){
                var structureWithMobileComps = mockStructure(true);
                var hiddenCompIdes = mobileOnlyComponentsHandler.getHiddenMobileOnlyComponentIds(structureWithMobileComps);

                expect(hiddenCompIdes).not.toContain('TINY_MENU');
                expect(hiddenCompIdes).not.toContain('EXIT_MOBILE');
                expect(hiddenCompIdes).not.toContain('BACK_TO_TOP_BUTTON');
            });

            it('should get ids of the mobile only components if they are hidden', function(){
                var structureWithoutMobileComps = mockStructure();
                var hiddenCompIdes = mobileOnlyComponentsHandler.getHiddenMobileOnlyComponentIds(structureWithoutMobileComps);
                expect(hiddenCompIdes).toContain('TINY_MENU');
            });
        });
    });
});
