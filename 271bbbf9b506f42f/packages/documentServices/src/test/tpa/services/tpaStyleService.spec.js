define([
    'lodash',
    'documentServices/tpa/services/tpaStyleService',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/componentDetectorAPI/componentDetectorAPI',
    'documentServices/theme/theme',
    'documentServices/component/componentStylesAndSkinsAPI',
    'documentServices/component/component'
], function(_, tpaStyleService, privateServicesHelper, componentDetectorAPI, theme, componentStylesAndSkinsAPI, component) {

    'use strict';

    describe('tpa Component Style Service', function() {

        var mockPs, compPointer, siteData;

        var style = {
            compId: 'hxyfbuxx',
            componentClassName: 'wysiwyg.viewer.components.tpapps.TPAWidget',
            id: 'tpaw0',
            pageId: '',
            skin: 'wysiwyg.viewer.skins.TPAWidgetSkin',
            style: {
                properties: {},
                propertiesSource: {}
            },
            styleType: 'custom',
            type: 'TopLevelStyle'
        };

        beforeEach(function() {
            siteData = privateServicesHelper.getSiteDataWithPages({'page1': {}, 'page2': {}});
            siteData.setCurrentPage('page1');
            mockPs = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

            var pageId = _.uniqueId('c1gsg');
            compPointer = {id: pageId, type: 'DESKTOP'};

            spyOn(componentDetectorAPI, 'getComponentById').and.returnValue(compPointer);
            spyOn(theme.styles, 'createItem').and.returnValue('style-id');
            spyOn(component, 'getType').and.returnValue('TPAWidget');
            spyOn(componentStylesAndSkinsAPI.style, 'setId');

        });

        describe('setStyleParam', function() {

            it('setStyleParam  - font (custom)', function() {
                var d = {
                    type: 'font',
                    key: 'fontFamily',
                    param: {
                        value: {
                            cssFontFamily: '"anton","sans-serif"',
                            family: 'anton',
                            fontParam: true,
                            index: 2,
                            value: 'anton'
                        }
                    }
                };

                var expectedStyleProperties = {
                    properties: {
                        'param_font_fontFamily': JSON.stringify(d.param.value)
                    },
                    propertiesSource: {
                        'param_font_fontFamily': 'value'
                    }
                };

                var expectedStyle = _.clone(style);
                expectedStyle.id = 'style-1';
                spyOn(theme.styles, 'get').and.returnValue(expectedStyle);
                theme.styles.createItem.and.returnValue(expectedStyle.id);

                expectedStyle.style = expectedStyleProperties;

                tpaStyleService.setStyleParam(mockPs, compPointer.id, d, jasmine.any(Function));
                expect(componentStylesAndSkinsAPI.style.setId).toHaveBeenCalledWith(mockPs, compPointer, expectedStyle.id, jasmine.any(Function));
                expect(theme.styles.createItem).toHaveBeenCalledWith(mockPs, expectedStyle);
            });

            it('setStyleParam  - font (pre-defined)', function() {
                var d = {
                    type: 'font',
                    key: 'fontFamily',
                    param: {
                        value: {
                            cssFontFamily: "'din-next-w01-light'',''din-next-w02-light'',''din-next-w10-light'',''sans-serif''",
                            family: 'din-next-w01-light',
                            fontStyleParam: true,
                            preset: 'Body-M',
                            size: 14
                        }
                    }
                };

                var expectedStyleProperties = {
                    properties: {
                        'param_font_fontFamily': JSON.stringify(d.param.value)
                    },
                    propertiesSource: {
                        'param_font_fontFamily': 'value'
                    }
                };

                var expectedStyle = _.clone(style);
                expectedStyle.id = 'style-2';
                spyOn(theme.styles, 'get').and.returnValue(expectedStyle);

                expectedStyle.style = expectedStyleProperties;

                tpaStyleService.setStyleParam(mockPs, compPointer.id, d);
                expect(theme.styles.createItem).toHaveBeenCalledWith(mockPs, expectedStyle);
            });

            it('setStyleParam  - color from site colors (theme)', function() {
                var d = {
                    type: 'color',
                    key: 'color-1',
                    param: {
                        value: {
                            color: {
                                name: 'color_3',
                                reference: 'primery-1',
                                value: '#ED1C24'
                            }
                        }
                    }
                };

                var expectedStyleProperties = {
                    properties: {
                        'param_color_color-1': d.param.value.color.name
                    },
                    propertiesSource: {
                        'param_color_color-1': 'theme'
                    }
                };

                var expectedStyle = _.clone(style);
                expectedStyle.id = 'style-3';
                spyOn(theme.styles, 'get').and.returnValue(expectedStyle);

                expectedStyle.style = expectedStyleProperties;

                tpaStyleService.setStyleParam(mockPs, compPointer.id, d);
                expect(theme.styles.createItem).toHaveBeenCalledWith(mockPs, expectedStyle);
            });

            it('setStyleParam  - color from all colors', function() {
                var d = {
                    type: 'color',
                    key: 'bgColor',
                    param: {
                        value: {
                            cssColor: '#666666'
                        }
                    }
                };

                var expectedStyleProperties = {
                    properties: {
                        'param_color_bgColor': d.param.value.cssColor
                    },
                    propertiesSource: {
                        'param_color_bgColor': 'value'
                    }
                };

                var expectedStyle = _.clone(style);
                expectedStyle.id = 'style-4';
                spyOn(theme.styles, 'get').and.returnValue(expectedStyle);

                expectedStyle.style = expectedStyleProperties;

                tpaStyleService.setStyleParam(mockPs, compPointer.id, d);
                expect(theme.styles.createItem).toHaveBeenCalledWith(mockPs, expectedStyle);
            });

            it('setStyleParam  - color from all colors with opacity', function() {
                var d = {
                    type: 'color',
                    key: 'colorWOpacity',
                    param: {
                        value: {
                            color: false,
                            opacity: 0.5375,
                            rgba: 'rgba(82,226,34,0.5375)'
                        }
                    }
                };

                var expectedStyleProperties = {
                    properties: {
                        'alpha-param_color_colorWOpacity': 0.5375,
                        'param_color_colorWOpacity': d.param.value.rgba
                    },
                    propertiesSource: {
                        'param_color_colorWOpacity': 'value'
                    }
                };

                var expectedStyle = _.clone(style);
                expectedStyle.id = 'style-5';
                spyOn(theme.styles, 'get').and.returnValue(expectedStyle);

                expectedStyle.style = expectedStyleProperties;

                tpaStyleService.setStyleParam(mockPs, compPointer.id, d);
                expect(theme.styles.createItem).toHaveBeenCalledWith(mockPs, expectedStyle);
            });

            it('setStyleParam  - color from site colors (theme) with opacity', function() {
                var d = {
                    type: 'color',
                    key: 'colorWOpacity',
                    param: {
                        value: {
                            color: {
                                name: 'color_29',
                                reference: 'color-19',
                                value: '#590025'
                            },
                            opacity: 0.5375,
                            rgba: 'rgba(82,226,34,0.5375)'
                        }
                    }
                };

                var expectedStyleProperties = {
                    properties: {
                        'alpha-param_color_colorWOpacity': 0.5375,
                        'param_color_colorWOpacity': d.param.value.color.name
                    },
                    propertiesSource: {
                        'param_color_colorWOpacity': 'theme'
                    }
                };

                var expectedStyle = _.clone(style);
                expectedStyle.id = 'style-6';
                spyOn(theme.styles, 'get').and.returnValue(expectedStyle);

                expectedStyle.style = expectedStyleProperties;

                tpaStyleService.setStyleParam(mockPs, compPointer.id, d);
                expect(theme.styles.createItem).toHaveBeenCalledWith(mockPs, expectedStyle);
            });

            it('setStyleParam  - number', function() {
                var d = {
                    type: 'number',
                    key: 'myValue',
                    param: {
                        value: 137.5
                    }
                };
                var expectedStyleProperties = {
                    properties: {
                        'param_number_myValue': d.param.value
                    },
                    propertiesSource: {
                        'param_number_myValue': 'value'
                    }
                };

                var expectedStyle = _.clone(style);
                expectedStyle.id = 'style-7';
                spyOn(theme.styles, 'get').and.returnValue(expectedStyle);

                expectedStyle.style = expectedStyleProperties;

                tpaStyleService.setStyleParam(mockPs, compPointer.id, d);
                expect(theme.styles.createItem).toHaveBeenCalledWith(mockPs, expectedStyle);
            });

            it('setStyleParam  - boolean', function() {
                var d = {
                    type: 'boolean',
                    key: 'checkMe',
                    param: {
                        value: false
                    }
                };

                var expectedStyleProperties = {
                    properties: {
                        'param_boolean_checkMe': d.param.value
                    },
                    propertiesSource: {
                        'param_boolean_checkMe': 'value'
                    }
                };

                var expectedStyle = _.clone(style);
                expectedStyle.id = 'style-8';
                spyOn(theme.styles, 'get').and.returnValue(expectedStyle);

                expectedStyle.style = expectedStyleProperties;

                tpaStyleService.setStyleParam(mockPs, compPointer.id, d);
                expect(theme.styles.createItem).toHaveBeenCalledWith(mockPs, expectedStyle);
            });

            it('should set default style to currentStyle', function () {
                var data = {
                    type: 'boolean',
                    key: 'checkMe',
                    param: {
                        value: false
                    }
                };
                var expectedStyle = _.clone(style);
                delete expectedStyle.style;
                spyOn(theme.styles, 'get').and.returnValue(expectedStyle);
                tpaStyleService.setStyleParam(mockPs, compPointer.id, data);

                expect(componentStylesAndSkinsAPI.style.setId).toHaveBeenCalled();

            });
        });

        describe('getTpaColorsToSiteColors', function() {
           it('should return the correct mapping of tpa colors to site colors', function() {
               var expected = {
                   "white/black": "color_1",
                   "black/white": "color_2",
                   "primery-1": "color_3",
                   "primery-2": "color_4",
                   "primery-3": "color_5",
                   "color-1": "color_11",
                   "color-2": "color_12",
                   "color-3": "color_13",
                   "color-4": "color_14",
                   "color-5": "color_15",
                   "color-6": "color_16",
                   "color-7": "color_17",
                   "color-8": "color_18",
                   "color-9": "color_19",
                   "color-10": "color_20",
                   "color-11": "color_21",
                   "color-12": "color_22",
                   "color-13": "color_23",
                   "color-14": "color_24",
                   "color-15": "color_25",
                   "color-16": "color_26",
                   "color-17": "color_27",
                   "color-18": "color_28",
                   "color-19": "color_29",
                   "color-20": "color_30",
                   "color-21": "color_31",
                   "color-22": "color_32",
                   "color-23": "color_33",
                   "color-24": "color_34",
                   "color-25": "color_35"
               };

               expect(tpaStyleService.getTpaColorsToSiteColors()).toEqual(expected);
           });
        });

    });
});
