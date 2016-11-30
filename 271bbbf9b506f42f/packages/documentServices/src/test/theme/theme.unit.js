define([
    'lodash', 'testUtils', 'utils',
    'documentServices/theme/theme',
    'documentServices/constants/constants',
    'documentServices/theme/skins/skinsByComponentType',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'color',
    'documentServices/theme/skins/editorSkinsData',
    'documentServices/component/componentModes'
], function
    (_, testUtils, utils, theme, constants,
     skinsByComponentType, privateServicesHelper,
     Color, editorSkinsData,
     componentModes) {
    'use strict';

    var siteData;

    describe('Theme API', function () {

        function getCompPointer(ps, compId, pageId) {
            var page = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
            return ps.pointers.components.getComponent(compId, page);
        }

        beforeEach(function () {
            siteData = testUtils.mockFactory.mockSiteData();
            this.privateApi = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData, {
                siteData: [{
                    path: ['orphanPermanentDataNodes'],
                    optional: true
                }]
            });

        });

        it('should return color using DAL', function () {
            siteData.addGeneralTheme(['#C4E7B6', '#A0CF8E', '#64B743', '#437A2D', '#213D16']);

            var c = theme.colors.get(this.privateApi, 'color_2');

            expect(c).toBe('#64B743');
        });


        it('should change data when setting color', function () {
            this.privateApi.dal.addGeneralTheme(['#C4E7B6', '#A0CF8E', '#64B743', '#437A2D', '#213D16']);

            theme.colors.update(this.privateApi, {'color_2': '#ff3'});
            var c = theme.colors.get(this.privateApi, 'color_2');
            expect(c).toBe('#FFFF33');
        });

        it('should return font using DAL', function () {
            siteData.addGeneralTheme([], [
                'normal normal normal 45px/1.4em Open+Sans {color_14}',
                'normal normal normal 13px/1.4em Arial {color_11}',
                'normal normal normal 24px/1.4em Open+Sans {color_14}',
                'normal normal normal 60px/1.4em Open+Sans {color_14}']);

            var c = theme.fonts.get(this.privateApi, 'font_1');

            expect(c).toBe('normal normal normal 13px/1.4em Arial {color_11}');
        });

        it('should not fail when given value has un valid structure', function () {
            siteData.addGeneralTheme([], [
                'normal normal normal 45px/1.4em Open+Sans {color_14}',
                'normal normal normal 13px/1.4em Arial {color_11}',
                'normal normal normal 24px/1.4em Open+Sans {color_14}',
                'normal normal normal 60px/1.4em Open+Sans {color_14}']);

            var font = '{haxs0r: font1}';
            var c = theme.fonts.get(this.privateApi, font);

            expect(c).toBe('Non valid font value ' + font);
        });

        it('should change data when setting font', function () {
            this.privateApi.dal.addGeneralTheme([], [
                'normal normal normal 45px/1.4em Open+Sans {color_14}',
                'normal normal normal 13px/1.4em Arial {color_11}',
                'normal normal normal 24px/1.4em Open+Sans {color_14}',
                'normal normal normal 60px/1.4em Open+Sans {color_14}']);

            theme.fonts.update(this.privateApi, {'font_1': 'normal normal normal 60px/1.4em Open+Sans {color_0}'});

            var c = theme.fonts.get(this.privateApi, 'font_1');

            expect(c).toBe('normal normal normal 60px/1.4em Open+Sans {color_0}');
        });

        it('updating a style with invalid parameters should fail', function () {
            var setStyle = theme.styles.update.bind(theme, this.privateApi);
            expect(setStyle.bind(this.privateApi)).toThrow();
            expect(setStyle.bind('mockStyleName')).toThrow();
            expect(setStyle.bind(null, 'mockStyleValue')).toThrow();
            expect(setStyle.bind('mockStyleName', {})).toThrow();
            expect(setStyle.bind('mockStyleName', {skin: 'mockValue'})).toThrow();
            expect(setStyle.bind('mockStyleName', {type: 'mockType'})).toThrow();
            expect(setStyle.bind('mockStyleName', '')).toThrow();
            expect(setStyle.bind('mockStyleName', 3)).toThrow();
        });

        it('updating an existing style with valid parameters should change the style data', function () {
            siteData.addCompTheme({id: 'mockStyle'});
            theme.styles.update(this.privateApi, 'mockStyle', {skin: 'mockValue', type: 'mockType'});

            var style = theme.styles.get(this.privateApi, 'mockStyle');
            expect(style).toEqual({id: 'mockStyle', skin: 'mockValue', type: 'mockType'});
        });

        it('adding a new style with valid parameters should add the style to data', function () {
            siteData.addCompTheme({id: 'mockStyle'});

            theme.styles.update(this.privateApi, 'mockNewStyle', {'skin': 'mockValue', type: 'mockType'});

            var style = theme.styles.get(this.privateApi, 'mockNewStyle');
            expect(style).toEqual({'skin': 'mockValue', type: 'mockType', id: 'mockNewStyle'});
        });

        it('should create a new custom style with same props as the given ones and return its id', function () {
            var fakeStyle = {
                'type': 'TopLevelStyle',
                'metaData': {
                    'isPreset': false,
                    'schemaVersion': '1.0',
                    'isHidden': false
                },
                'style': {
                    'propertiesSource': {
                        'fillcolor': 'theme',
                        'stroke': 'theme',
                        'strokewidth': 'value'
                    },
                    'properties': {
                        'alpha-fillcolor': '1',
                        'alpha-stroke': '1',
                        'fillcolor': 'color_11',
                        'stroke': 'color_15',
                        'strokewidth': '1px'
                    },
                    'groups': {}
                },
                'componentClassName': 'wysiwyg.viewer.components.svgshape.SvgShape',
                'pageId': '',
                'styleType': 'custom',
                'skin': 'svgshape.v1.svg_8463f60718194af748c49dddbe45b668.HollowCircle',
                'id': 'i5rver43_i5rver43',
                'compId': 'i5rver43'
            };

            var newStyleId = theme.styles.createItem(this.privateApi, fakeStyle);

            var newStyleProperties = theme.styles.get(this.privateApi, newStyleId);
            expect(_.omit(newStyleProperties, ['id', 'compId'])).toEqual(_.omit(fakeStyle, ['id', 'compId']));
            expect(newStyleProperties.id).toEqual(newStyleId);
            expect(newStyleProperties.compId).toEqual('');
            expect(newStyleProperties.pageId).toEqual('');
        });

        it('should create a new system style with same props as the given ones and return its id', function () {
            var fakeStyle = {
                'type': 'TopLevelStyle',
                'id': 'bgis2',
                'metaData': {
                    'isPreset': false,
                    'schemaVersion': '1.0',
                    'isHidden': false
                },
                'style': {
                    'properties': {
                        'alpha-bg': '1',
                        'alpha-brd': '1',
                        'alpha-brd2': '1',
                        'bg': '#7B5699',
                        'bgPosition': '0',
                        'bordersPosition': '6',
                        'boxShadowToggleOn-shd': 'true',
                        'brd': 'color_1',
                        'brd2': 'color_14',
                        'innerLineSize': '1',
                        'lineGap': '5',
                        'outerLineSize': '3',
                        'shd': '0 0 5px rgba(0, 0, 0, 0.7)'
                    },
                    'propertiesSource': {
                        'bg': 'value',
                        'bgPosition': 'value',
                        'bordersPosition': 'value',
                        'brd': 'theme',
                        'brd2': 'theme',
                        'innerLineSize': 'value',
                        'lineGap': 'value',
                        'outerLineSize': 'value',
                        'shd': 'value'
                    },
                    'groups': {}
                },
                'componentClassName': '',
                'pageId': '',
                'compId': '',
                'styleType': 'system',
                'skin': 'skins.viewer.bgimagestrip.DoubleBorderScreenSkin'
            };

            var systemStyleId = 'bgis2';

            var newStyleId = theme.styles.createItem(this.privateApi, fakeStyle, systemStyleId);

            var newStyleProperties = theme.styles.get(this.privateApi, newStyleId);
            expect(_.omit(newStyleProperties, ['id', 'compId'])).toEqual(_.omit(fakeStyle, ['id', 'compId']));
            expect(newStyleProperties.id).toEqual(newStyleId);
            expect(systemStyleId).toEqual(newStyleId);
        });

        it('should throw if trying to create a system style with an unknown id', function () {
            var fakeStyle = {
                'type': 'TopLevelStyle',
                'id': 'bgis_new',
                'metaData': {
                    'isPreset': false,
                    'schemaVersion': '1.0',
                    'isHidden': false
                },
                'style': {
                    'properties': {
                        'alpha-bg': '1',
                        'alpha-brd': '1',
                        'alpha-brd2': '1',
                        'bg': '#7B5699',
                        'bgPosition': '0',
                        'bordersPosition': '6',
                        'boxShadowToggleOn-shd': 'true',
                        'brd': 'color_1',
                        'brd2': 'color_14',
                        'innerLineSize': '1',
                        'lineGap': '5',
                        'outerLineSize': '3',
                        'shd': '0 0 5px rgba(0, 0, 0, 0.7)'
                    },
                    'propertiesSource': {
                        'bg': 'value',
                        'bgPosition': 'value',
                        'bordersPosition': 'value',
                        'brd': 'theme',
                        'brd2': 'theme',
                        'innerLineSize': 'value',
                        'lineGap': 'value',
                        'outerLineSize': 'value',
                        'shd': 'value'
                    },
                    'groups': {}
                },
                'componentClassName': '',
                'pageId': '',
                'compId': '',
                'styleType': 'system',
                'skin': 'skins.viewer.bgimagestrip.DoubleBorderScreenSkin'
            };
            var unknownSystemStyleId = '$unknownSystemStyleId$';
            var expectedError = new Error('Unable to create a system style whose id - ' + unknownSystemStyleId + ', is not in componentDefinitionMap');

            expect(theme.styles.createItem.bind(theme.styles, this.privateApi, fakeStyle, unknownSystemStyleId)).toThrow(expectedError);
        });

        it('should throw an error in case the given style props are invalid', function () {
        });

        it('should create an empty style properties object in case the given styleRawData has no style properties', function () {
            var fakeStyle = {
                'type': 'TopLevelStyle',
                'id': 'bgis_new',
                'metaData': {
                    'isPreset': false,
                    'schemaVersion': '1.0',
                    'isHidden': false
                },
                'componentClassName': '',
                'pageId': '',
                'compId': '',
                'styleType': 'custom',
                'skin': 'skins.viewer.bgimagestrip.DoubleBorderScreenSkin'
            };

            var newStyleId = theme.styles.createItem(this.privateApi, fakeStyle);

            expect(theme.styles.get(this.privateApi, newStyleId).style).toEqual({
                properties: {},
                propertiesSource: {}
            });
        });

        describe('Theme - input validation', function () {
            describe('Font validation', function () {
                beforeEach(function () {
                    this.privateApi.dal.addGeneralTheme([], [
                        'normal normal normal 45px/1.4em Open+Sans {color_14}',
                        'normal normal normal 13px/1.4em Arial {color_11}',
                        'normal normal normal 24px/1.4em Open+Sans {color_14}',
                        'normal normal normal 60px/1.4em Open+Sans {color_14}'
                    ]);
                });

                it('check font key is in font schema (font between 0-10)', function () {
                    var value = 'normal normal normal 40px/1.4em din-next-w01-light {color_14}';
                    expect(function () {
                        theme.fonts.update(this.privateApi, {'font11': value});
                    }.bind(this)).toThrow(new Error('Invalid Key font11'));
                });

                it('check font style is valid', function () {
                    var value = 'fakeStyle normal normal 40px/1.4em din-next-w01-light {color_3}';
                    expect(function () {
                        theme.fonts.update(this.privateApi, {'font_0': value});
                    }.bind(this)).toThrow(new Error("font-style isn't valid. possible values are: " + theme.FONT_POSSIBLE_VALUES.STYLE));
                });
                it('check font variant is valid', function () {
                    var value = 'normal fakeVariant normal 40px/1.4em din-next-w01-light {color_3}';
                    expect(function () {
                        theme.fonts.update(this.privateApi, {'font_0': value});
                    }.bind(this)).toThrow(new Error("font-variant isn't valid. possible values are: " + theme.FONT_POSSIBLE_VALUES.VARIANT));
                });

                it('check font weight is valid', function () {
                    var value = 'normal normal fakeWeight 40px/1.4em din-next-w01-light {color_3}';
                    expect(function () {
                        theme.fonts.update(this.privateApi, {'font_0': value});
                    }.bind(this)).toThrow(new Error("font-weight isn't valid. possible values are: " + theme.FONT_POSSIBLE_VALUES.WEIGHT));
                });

                it('check font size is valid', function () {
                    var value = 'normal normal normal 40/1.4em din-next-w01-light {color_3}';
                    expect(function () {
                        theme.fonts.update(this.privateApi, {'font_0': value});
                    }.bind(this)).toThrow(new Error("font-size isn't valid.Correct format is: fontSize+unit.Possible units allowed are: " + theme.FONT_POSSIBLE_VALUES.UNITS));
                });

                it('check font size is valid', function () {
                    var value = 'normal normal normal px/1.4em din-next-w01-light {color_3}';
                    expect(function () {
                        theme.fonts.update(this.privateApi, {'font_0': value});
                    }.bind(this)).toThrow(new Error("font-size isn't valid.Correct format is: fontSize+unit.Possible units allowed are: " + theme.FONT_POSSIBLE_VALUES.UNITS));
                });

                it('check font line-height is valid', function () {
                    var value = 'normal normal normal 40px/1.4 din-next-w01-light {color_3}';
                    expect(function () {
                        theme.fonts.update(this.privateApi, {'font_0': value});
                    }.bind(this)).toThrow(new Error("line-height isn't valid.Correct format is: lineHeight+unit.Possible units allowed are: " + theme.FONT_POSSIBLE_VALUES.UNITS));
                });

                it('check font line-height is valid', function () {
                    var value = 'normal normal normal 40px/em din-next-w01-light {color_3}';
                    expect(function () {
                        theme.fonts.update(this.privateApi, {'font_0': value});
                    }.bind(this)).toThrow(new Error("line-height isn't valid.Correct format is: lineHeight+unit.Possible units allowed are: " + theme.FONT_POSSIBLE_VALUES.UNITS));
                });

                it('check color is valid - will not allow color without {}', function () {
                    var value = 'normal normal normal 40px/1.4em din-next-w01-light color_3';
                    expect(function () {
                        theme.fonts.update(this.privateApi, {'font_0': value});
                    }.bind(this)).toThrow(new Error("color isn't in correct format.Correct format is {color_5} or rgba/hex"));
                });

                it('check color is valid -should allow valid hex', function () {
                    var value = 'normal normal normal 40px/1.4em fredericka+the+great #010000';
                    expect(function () {
                        theme.fonts.update(this.privateApi, {'font_0': value});
                    }.bind(this)).not.toThrow(new Error("color isn't in correct format.Correct format is {color_5} or rgba/hex"));
                });

                it('check color is valid -should not allow  a non valid hex', function () {
                    var value = 'normal normal normal 40px/1.4em fredericka+the+great #ZZZ';
                    expect(function () {
                        theme.fonts.update(this.privateApi, {'font_0': value});
                    }.bind(this)).toThrow(new Error("color isn't in correct format.Correct format is {color_5} or rgba/hex"));
                });
            });

            describe('Color validation', function () {

                beforeEach(function () {
                    siteData.addGeneralTheme(['#C4E7B6', '#A0CF8E', '#64B743', '#437A2D', '#213D16']);
                });

                it('check color is in schema', function () {
                    var value = '{color_10}';
                    expect(function () {
                        theme.colors.update(this.privateApi, {'color_50': value});
                    }.bind(this)).toThrow(new Error("Invalid Key color_50"));
                });

                it('check color value is correct- theme color', function () {
                    var value = 'color_10';
                    expect(function () {
                        theme.colors.update(this.privateApi, {'color_0': value});
                    }.bind(this)).toThrow(new Error("color value isn't valid " + value + " .Please supply or hex/rgb string"));
                });

                it('check color value is correct - hex is not correct', function () {
                    var value = '#ZZZ';
                    expect(function () {
                        theme.colors.update(this.privateApi, {'color_0': value});
                    }.bind(this)).toThrow(new Error("color value isn't valid " + value + " .Please supply or hex/rgb string"));
                });

                it('check color value is correct - rgba is correct', function () {
                    var value = 'rgba(1,1,1,1)';
                    expect(function () {
                        theme.colors.update(this.privateApi, {'color_0': value});
                    }.bind(this)).not.toThrow(new Error("color value isn't valid " + value + " .Please supply or hex/rgb string"));
                });

                it('check color value is correct - rgba is not correct', function () {
                    var value = 'rgba(1,300,1,1)';
                    expect(function () {
                        theme.colors.update(this.privateApi, {'color_0': value});
                    }.bind(this)).toThrow(new Error("color value isn't valid " + value + " .Please supply or hex/rgb string"));
                });

                it('check color value is correct - rgba is not correct', function () {
                    var value = 'rgba(1,1,1,5)';
                    expect(function () {
                        theme.colors.update(this.privateApi, {'color_0': value});
                    }.bind(this)).toThrow(new Error("color value isn't valid " + value + " .Please supply or hex/rgb string"));
                });

            });

            describe('Color Rendering', function () {
                it('should render the correct color if value is rgba', function () {
                    var color = '255, 255, 255, 1';
                    var renderedColor = theme.colors.render(this.privateApi, color);

                    expect(renderedColor).toBe('rgba(255, 255, 255, 1)');
                });

                it('should render the correct color if value is rgb', function () {
                    var color = '0, 0, 0';
                    var renderedColor = theme.colors.render(this.privateApi, color);

                    expect(renderedColor).toBe('rgb(0, 0, 0)');
                });

                it('should render hex color if provided value is hex', function () {
                    var color = '#FF0000';
                    var renderedColor = theme.colors.render(this.privateApi, color);

                    expect(renderedColor).toBe(color);
                });

                it('should render theme color if the color is present in the theme', function () {
                    var color = 'color_0';
                    siteData.addGeneralTheme(['#C4E7B6']);
                    var renderedColor = theme.colors.render(this.privateApi, color);


                    expect(renderedColor).toBe('#C4E7B6');
                });
            });
        });

        describe('Theme - theme.skins ', function () {
            it('should have a getComponentSkins function', function () {
                expect(theme.skins.getComponentSkins).toBeDefined();
            });
            it('getComponentSkins should receive a compRef and return the supported skins', function () {
                var containerCompType = 'core.components.Container';
                var expectedSkins = skinsByComponentType[containerCompType];

                expect(theme.skins.getComponentSkins(this.privateApi, containerCompType)).toEqual(expectedSkins);
            });
            it('should have a getSkinDefinition function', function () {
                expect(theme.skins.getSkinDefinition).toBeDefined();
            });
            it('getSkinDefinition should return the default skin definition for svg when the requested skin name is an svg skin type', function () {
                var defaultSvgSkinDefinition = editorSkinsData['skins.viewer.svgshape.SvgShapeDefaultSkin'];
                var privateServices = {};
                expect(theme.skins.getSkinDefinition(privateServices, "svgshape.v1.svg_fb1b725bec7b60cce141453398672f7c.Rectangle")).toEqual(defaultSvgSkinDefinition);
                expect(theme.skins.getSkinDefinition(privateServices, "svgshape.v2.Svg_5a40d0bf85a840d39b35d3ae591c839f")).toEqual(defaultSvgSkinDefinition);
            });
        });

        describe('Theme - initialization', function () {
            function getStyleDef(pageId, compId, skin) {
                return {
                    compId: compId || '',
                    componentClassName: 'comp',
                    pageId: pageId || "",
                    styleType: "custom",
                    type: "TopLevelStyle",
                    skin: skin || 'compSkin',
                    style: {
                        groups: {},
                        properties: {},
                        propertiesSource: {}
                    }
                };
            }

            describe('Styles garbage collection', function () {
                it('should delete style that has no references', function () {
                    spyOn(this.privateApi.siteAPI, 'collectUsedStylesFromAllPages').and.callFake(function () {
                        return _.omit(theme.styles.getAll(this.privateApi), orphanStyleId);
                    }.bind(this));
                    var orphanStyleId = theme.styles.createItem(this.privateApi, getStyleDef());

                    theme.initialize(this.privateApi, {runStylesGC: true});

                    expect(theme.styles.get(this.privateApi, orphanStyleId)).toBeUndefined();
                });
                it('should not delete style that has reference from mobile component only', function () {
                    var styleId = "style-i9ednby8";
                    var styleDef = {
                        "componentClassName": "wysiwyg.viewer.components.mobile.TinyMenu",
                        "pageId": "",
                        "compId": "",
                        "styleType": "custom",
                        "style": {
                            "properties": {
                                "bg": "#7d0b6d",
                                "bgs": "#b327a7",
                                "txt": "#FFFFFF",
                                "txts": "#FFFFFF"
                            },
                            "propertiesSource": {
                                "bg": "value",
                                "bgs": "value",
                                "txt": "value",
                                "txts": "value"
                            },
                            "groups": {}
                        },
                        "type": "TopLevelStyle",
                        "id": styleId,
                        "skin": "wysiwyg.viewer.skins.mobile.TinyMenuSkin"
                    };
                    var stylePath = ['pagesData', 'masterPage', 'data', 'theme_data', styleId];
                    this.privateApi.dal.full.setByPath(stylePath, styleDef);
                    spyOn(this.privateApi.siteAPI, 'collectUsedStylesFromAllPages').and.callFake(function () {
                        return theme.styles.getAll(this.privateApi);
                    }.bind(this));

                    theme.initialize(this.privateApi, {runStylesGC: true});

                    expect(theme.styles.get(this.privateApi, styleId)).toBeDefined();
                });

                it('should not delete system style that has no reference', function () {
                    var systemStyleId = 'ib1';
                    var styleDef = _.assign(getStyleDef(), {id: systemStyleId, styleType: 'system'});
                    theme.styles.createItem(this.privateApi, styleDef, systemStyleId);
                    spyOn(this.privateApi.siteAPI, 'collectUsedStylesFromAllPages').and.callFake(function () {
                        return _.omit(theme.styles.getAll(this.privateApi), systemStyleId);
                    }.bind(this));

                    theme.initialize(this.privateApi, {runStylesGC: true});

                    expect(theme.styles.get(this.privateApi, systemStyleId)).toBeDefined();
                });

                describe('component in page with styleId', function () {
                    beforeEach(function () {
                        this.pageId = 'currentPage';
                        var mockedCompStructure = privateServicesHelper.createMockCompWithStyleDataProperties('wysiwyg.viewer.components.SliderGallery').compStructure;
                        testUtils.mockFactory.addCompToPage(siteData, this.pageId, mockedCompStructure);
                        this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData, {
                            siteData: [{
                                path: ['orphanPermanentDataNodes'],
                                optional: true
                            }]
                        });

                        this.compPointer = getCompPointer(this.ps, mockedCompStructure.id, this.pageId);
                        var styleDef = getStyleDef(this.pageId, mockedCompStructure.id, mockedCompStructure.skin);
                        this.compStyleId = theme.styles.createItem(this.ps, styleDef);
                        var styleIdPointer = this.ps.pointers.getInnerPointer(this.compPointer, 'styleId');
                        this.ps.dal.set(styleIdPointer, this.compStyleId);
                    });

                    it('should not remove styles if they are not used in displayed json but used in full json', function () {
                        var parentComp = this.ps.pointers.components.getParent(this.compPointer);
                        var parentModeId = privateServicesHelper.getOrCreateCompMode(this.ps, parentComp, utils.siteConstants.COMP_MODES_TYPES.HOVER);
                        componentModes.activateComponentMode(this.ps, parentComp, parentModeId);
                        this.ps.dal.remove(this.compPointer);

                        theme.initialize(this.ps, {runStylesGC: true});

                        expect(theme.styles.get(this.ps, this.compStyleId)).toBeDefined();
                    });

                    it('should remove styles if they are not used in full json', function () {
                        this.ps.dal.remove(this.compPointer);

                        theme.initialize(this.ps, {runStylesGC: true});

                        expect(theme.styles.get(this.ps, this.compStyleId)).not.toBeDefined();
                    });
                });
            });

            var mockCompsDefinitionsMap = {
                "someComponentType": {
                    skins: [],
                    dataTypes: [],
                    propertyTypes: [],
                    styles: {
                        'realSystemStyle': 'someCompSkin'
                    }
                }
            };

            var mockCompsDef = {
                'documentServices/component/componentsDefinitionsMap': mockCompsDefinitionsMap
            };

            testUtils.requireWithMocks('documentServices/theme/theme', mockCompsDef, function (themeMock) {
                describe('Styles type fixing', function () {
                    beforeEach(function () {
                        spyOn(this.privateApi.siteAPI, 'collectUsedStylesFromAllPages').and.callFake(function () {
                            return themeMock.styles.getAll(this.privateApi);
                        }.bind(this));
                    });

                    it('should convert "fake" system styles to custom styles', function () {
                        var fakeSystemStyleId = 'fakeSystemStyle';
                        var styleDef = _.assign(getStyleDef(), {id: fakeSystemStyleId, styleType: 'system'});
                        siteData.addCompTheme(_.assign({id: fakeSystemStyleId}, styleDef));

                        themeMock.initialize(this.privateApi, {runStylesGC: true});

                        var fakeSystemStyleAfterConversion = themeMock.styles.get(this.privateApi, fakeSystemStyleId);
                        expect(fakeSystemStyleAfterConversion.styleType).toBe('custom');
                    });

                    it('should NOT convert real system styles to custom styles', function () {
                        var realSystemStyleId = 'realSystemStyle';
                        var styleDef = _.assign(getStyleDef(), {id: realSystemStyleId, styleType: 'system'});

                        siteData.addCompTheme(_.assign({id: realSystemStyleId}, styleDef));

                        themeMock.initialize(this.privateApi, {runStylesGC: true});

                        var realSystemStyleAfterConversion = themeMock.styles.get(this.privateApi, realSystemStyleId);
                        expect(realSystemStyleAfterConversion.styleType).toBe('system');
                    });
                });
            });
        });

        describe('characterSet', function () {
            it('should return the default character set ["latin"] if not defined', function () {
                var siteDataWithSiteCharacterSet = privateServicesHelper.getSiteDataWithPages();
                var privateApiWithSiteData = privateServicesHelper.mockPrivateServicesWithRealDAL(siteDataWithSiteCharacterSet);
                expect(theme.fonts.getCharacterSet(privateApiWithSiteData)).toEqual(['latin']);
            });

            it('should return add latin to defined character set if missing', function () {
                var siteDataWithSiteCharacterSet = privateServicesHelper.getSiteDataWithPages();

                siteDataWithSiteCharacterSet.pagesData.masterPage.data.document_data.masterPage.characterSets = [];
                var privateApiWithSiteData = privateServicesHelper.mockPrivateServicesWithRealDAL(siteDataWithSiteCharacterSet);
                expect(theme.fonts.getCharacterSet(privateApiWithSiteData)).toEqual(['latin']);

                siteDataWithSiteCharacterSet.pagesData.masterPage.data.document_data.masterPage.characterSets = ['a'];
                privateApiWithSiteData = privateServicesHelper.mockPrivateServicesWithRealDAL(siteDataWithSiteCharacterSet);
                expect(theme.fonts.getCharacterSet(privateApiWithSiteData)).toEqual(['a', 'latin']);
            });

            it('should return the character set as defined', function () {
                var siteDataWithSiteCharacterSet = privateServicesHelper.getSiteDataWithPages();
                siteDataWithSiteCharacterSet.pagesData.masterPage.data.document_data.masterPage.characterSets = ['a', 'latin'];
                var privateApiWithSiteData = privateServicesHelper.mockPrivateServicesWithRealDAL(siteDataWithSiteCharacterSet);
                expect(theme.fonts.getCharacterSet(privateApiWithSiteData)).toEqual(['a', 'latin']);
            });

            it('should update the character sets in the site structure', function () {
                var siteDataWithSiteCharacterSet = privateServicesHelper.getSiteDataWithPages();
                var privateApiWithSiteData = privateServicesHelper.mockPrivateServicesWithRealDAL(siteDataWithSiteCharacterSet);
                theme.fonts.updateCharacterSet(privateApiWithSiteData, ['a', 'latin']);
                expect(theme.fonts.getCharacterSet(privateApiWithSiteData)).toEqual(['a', 'latin']);
            });

            it('should not fail or update the character set data', function () {
                var siteDataWithSiteCharacterSet = privateServicesHelper.getSiteDataWithPages();
                siteDataWithSiteCharacterSet.pagesData.masterPage.data.document_data.masterPage.characterSets = ['a', 'latin'];
                var privateApiWithSiteData = privateServicesHelper.mockPrivateServicesWithRealDAL(siteDataWithSiteCharacterSet);

                theme.fonts.updateCharacterSet(privateApiWithSiteData, undefined);

                expect(theme.fonts.getCharacterSet(privateApiWithSiteData)).toEqual(['a', 'latin']);
            });

            describe('getLanguageCharacterSet', function () {
                it('should return "latin-ext", "latin" for "pl"', function () {
                    expect(theme.fonts.getLanguageCharacterSet(undefined, 'pl')).toEqual(['latin-ext', 'latin']);
                });

                it('should return "cyrillic", "latin" for "ru"', function () {
                    expect(theme.fonts.getLanguageCharacterSet(undefined, 'ru')).toEqual(['cyrillic', 'latin']);
                });

                it('should return "japanese", "latin" for "ja"', function () {
                    expect(theme.fonts.getLanguageCharacterSet(undefined, 'ja')).toEqual(['japanese', 'latin']);
                });

                it('should return "korean", "latin" for "ko"', function () {
                    expect(theme.fonts.getLanguageCharacterSet(undefined, 'ko')).toEqual(['korean', 'latin']);
                });
            });


            var mockGeneralInfoIRL = {
                getGeo: function () {
                    return 'IRL';
                }
            };

            var mockGeneralInfoISR = {
                getGeo: function () {
                    return 'ISR';
                }
            };


            var mockGeoIRL = {
                'documentServices/siteMetadata/generalInfo': mockGeneralInfoIRL
            };

            var mockGeoISR = {
                'documentServices/siteMetadata/generalInfo': mockGeneralInfoISR
            };

            describe('getCharacterSetByGeo', function () {
                testUtils.requireWithMocks('documentServices/theme/theme', mockGeoIRL, function (mockTheme) {
                    it('should return the default ["latin"] for GEO without character sets', function () {
                        expect(mockTheme.fonts.getCharacterSetByGeo()).toEqual(['latin']);
                    });
                });

                testUtils.requireWithMocks('documentServices/theme/theme', mockGeoISR, function (mockTheme) {
                    it('should return the "latin", "hebrew", "arabic" for get "ISR"', function () {
                        expect(mockTheme.fonts.getCharacterSetByGeo()).toEqual(['hebrew', 'arabic', 'latin']);
                    });
                });
            });

            describe('updateCharacterSet', function () {
                it('should update new character sets', function () {
                    var siteDataWithSiteCharacterSet = privateServicesHelper.getSiteDataWithPages();
                    var privateApiWithSiteData = privateServicesHelper.mockPrivateServicesWithRealDAL(siteDataWithSiteCharacterSet);
                    theme.fonts.updateCharacterSet(privateApiWithSiteData, ['latin', 'hebrew']);
                    expect(theme.fonts.getCharacterSet(privateApiWithSiteData)).toEqual(['latin', 'hebrew']);
                });

                it('should return latin when updating empty character sets array', function () {
                    var siteDataWithSiteCharacterSet = privateServicesHelper.getSiteDataWithPages();
                    var privateApiWithSiteData = privateServicesHelper.mockPrivateServicesWithRealDAL(siteDataWithSiteCharacterSet);
                    theme.fonts.updateCharacterSet(privateApiWithSiteData, []);
                    expect(theme.fonts.getCharacterSet(privateApiWithSiteData)).toEqual(['latin']);
                });

                it('should return updatated character sets when removing character set ', function () {
                    var siteDataWithSiteCharacterSet = privateServicesHelper.getSiteDataWithPages();
                    var privateApiWithSiteData = privateServicesHelper.mockPrivateServicesWithRealDAL(siteDataWithSiteCharacterSet);
                    theme.fonts.updateCharacterSet(privateApiWithSiteData, ['hebrew', 'arabic', 'latin']);
                    theme.fonts.updateCharacterSet(privateApiWithSiteData, ['hebrew', 'latin']);
                    expect(theme.fonts.getCharacterSet(privateApiWithSiteData)).toEqual(['hebrew', 'latin']);
                });
            });
        });
        describe('colors: getCssString', function () {

            it('should return the css string for the theme colors, and background colors', function () {

                this.privateApi.dal.addGeneralTheme(['#123456', '#FFFFFF', '255, 255, 255, 0.4']);

                var expected =
                    ".color_0 {color: #123456;}\n" +
                    ".backcolor_0 {background-color: #123456;}\n" +
                    ".color_1 {color: #FFFFFF;}\n" +
                    ".backcolor_1 {background-color: #FFFFFF;}\n" +
                    ".color_2 {color: rgba(255, 255, 255, 0.4);}\n" +
                    ".backcolor_2 {background-color: rgba(255, 255, 255, 0.4);}\n";

                expect(theme.colors.getCssString(this.privateApi)).toEqual(expected);
            });

        });

        var fontsMetaDataMock = {
            "arial": {
                "displayName": "Arial",
                "fontFamily": "arial",
                "cdnName": "",
                "genericFamily": "sans-serif",
                "provider": "system",
                "characterSets": [
                    "latin",
                    "latin-ext",
                    "cyrillic",
                    "hebrew",
                    "arabic"
                ],
                "permissions": "all",
                "fallbacks": "arial_fallback",
                "spriteIndex": 2
            },
            "lobster": {
                "displayName": "Lobster",
                "fontFamily": "lobster",
                "cdnName": "Lobster",
                "genericFamily": "cursive",
                "provider": "google",
                "characterSets": [
                    "latin",
                    "latin-ext",
                    "cyrillic"
                ],
                "permissions": "all",
                "fallbacks": "",
                "spriteIndex": 54
            }
        };

        var fontsMock = {'fonts/utils/fontMetadata': fontsMetaDataMock};


        testUtils.requireWithMocks('documentServices/theme/theme', fontsMock, function (mockTheme) {
            describe('getThemeStyles', function () {
                it('should return a string of themeFonts css styles with colors', function () {
                    siteData.addGeneralTheme(['#C4E7B6', '#A0CF8E', '#64B743', '#437A2D', '#213D16'], [
                        'normal normal normal 45px/1.4em Lobster {color_0}',
                        'normal normal normal 13px/1.4em Arial {color_1}'
                    ]);

                    var expected =
                        '.font_0 {font: normal normal normal 45px/1.4em Lobster,cursive ;color:#C4E7B6;} \n' +
                        '.font_1 {font: normal normal normal 13px/1.4em Arial,arial_fallback,sans-serif ;color:#A0CF8E;} \n';

                    expect(mockTheme.fonts.getThemeStyles(this.privateApi)).toEqual(expected);
                });
            });

            describe('getThemeFontsMap', function () {
                it('should return theme font as a map with colors', function () {

                    siteData.addGeneralTheme(['#C4E7B6', '#A0CF8E', '#64B743', '#437A2D', '#213D16'], [
                        'normal normal normal 45px/1.4em Lobster {color_0}',
                        'normal normal normal 13px/1.4em Arial {color_1}'
                    ]);

                    var expected = {
                        'font_0': {
                            style: 'normal',
                            variant: 'normal',
                            weight: 'normal',
                            size: '45px',
                            lineHeight: '1.4em',
                            family: 'Lobster',
                            color: '{color_0}',
                            bold: false,
                            italic: false,
                            fontWithFallbacks: 'lobster,cursive',
                            cssColor: '#C4E7B6'
                        },
                        'font_1': {
                            style: 'normal',
                            variant: 'normal',
                            weight: 'normal',
                            size: '13px',
                            lineHeight: '1.4em',
                            family: 'Arial',
                            color: '{color_1}',
                            bold: false,
                            italic: false,
                            fontWithFallbacks: 'arial,arial_fallback,sans-serif',
                            cssColor: '#A0CF8E'
                        }
                    };

                    expect(mockTheme.fonts.getMap(this.privateApi)).toEqual(expected);

                });
            });
        });

        describe('removeListener', function () {
            var callback1, callback2;

            beforeEach(function () {
                callback1 = jasmine.createSpy('callback1');
                callback2 = jasmine.createSpy('callback1');
            });

            it('should remove listener if listenerId is 0', function () {
                var listenerId = theme.events.onChange.addListener({}, callback1);
                expect(listenerId).toEqual(0);
                theme.events.onChange.removeListener({}, listenerId);

                theme.events.onChange.executeListeners();

                expect(callback1).not.toHaveBeenCalled();
            });

            it('should remove listener', function () {
                theme.events.onChange.addListener({}, callback1);
                var listenerId2 = theme.events.onChange.addListener({}, callback2);

                theme.events.onChange.removeListener({}, listenerId2);

                theme.events.onChange.executeListeners();

                expect(callback1).toHaveBeenCalled();
                expect(callback2).not.toHaveBeenCalled();
            });

            it('should not remove listener if listener Id is not defined', function () {
                var errorFunc = function () {
                    theme.events.onChange.removeListener({}, undefined);
                };
                expect(errorFunc).toThrowError();
            });

            it('should not remove listener if listener Id is null', function () {
                var errorFunc = function () {
                    theme.events.onChange.removeListener({}, null);
                };
                expect(errorFunc).toThrowError();
            });
        });
    });
});
