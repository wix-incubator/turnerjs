define(['lodash', 'dataFixer/plugins/stylesFixer', 'definition!dataFixer/plugins/stylesFixer', 'experiment', 'testUtils'], function (_, stylesFixer, stylesFixerDef, experiment, testUtils) {
    'use strict';

    var openExperiments = testUtils.experimentHelper.openExperiments;

    function areStyleSizeParamsValid(style) {
        if (style.style && style.style.properties) {
            _.forEach(style.style.properties, function (param) {
                if (/\dx/.test(param)) {
                    return false;
                }
            });
        }
        return true;
    }

    function fixSizeParam(paramValue) {
        return paramValue.replace(/\dx/g, function (match) {
            return match.replace('x', 'px');
        });
    }

    describe("stylesFixer spec", function () {
        describe("style params that use 'x' for size instead of 'px' should be fixed", function () {
            beforeEach(function () {
                this.page = {
                    data: {
                        theme_data: {
                            styleName: {
                                style: {
                                    properties: {
                                    }
                                }
                            }
                        }
                    }
                };

                this.style = this.page.data.theme_data.styleName.style;
            });

            it('param with all values pixel values corrupted should be fixed', function () {
                this.style.properties = {
                    paramName: 'dfgdf 4x dht 60xki%^&'
                };
                var style = this.page.data.theme_data.styleName;
                var styleParams = style.style.properties;
                var originalValue = styleParams.paramName;

                stylesFixer.exec(this.page);

                expect(areStyleSizeParamsValid(style)).toBeTruthy();
                expect(styleParams.paramName).toEqual('dfgdf 4px dht 60pxki%^&');
                expect(styleParams.paramName).toEqual(fixSizeParam(originalValue));

            });

            it('param with valid and invalid pixel values fixes only the invalid ones', function () {
                this.style.properties = {
                    paramName: 'dfgdf 4px dht 60xki%^&'
                };
                var style = this.page.data.theme_data.styleName;
                var styleParams = style.style.properties;
                var originalValue = styleParams.paramName;

                stylesFixer.exec(this.page);

                expect(areStyleSizeParamsValid(style)).toBeTruthy();
                expect(styleParams.paramName).toEqual('dfgdf 4px dht 60pxki%^&');
                expect(styleParams.paramName).toEqual(fixSizeParam(originalValue));

            });

            it('test the regex used to verify it does not fix valid params', function () {
                this.style.properties = {
                    paramName1: 'dfgdf 4px dht 43pxxki%^&',
                    paramName2: '5px',
                    paramName3: '5fx'
                };
                var style = this.page.data.theme_data.styleName;
                var styleParams = style.style.properties;

                _.forEach(styleParams, function (originalParam, paramName) {
                    var originalValue = originalParam;

                    stylesFixer.exec(this.page);

                    expect(areStyleSizeParamsValid(style)).toBeTruthy();
                    expect(styleParams[paramName]).toEqual(originalValue);
                    expect(fixSizeParam(originalValue)).toEqual(originalValue);
                }, this);
            });
        });

        describe("Text styles fix", function () {
            it('should create txtNew style if missing', function () {
                var page = {
                    data: {
                        theme_data: {
                            styleName: {
                                style: {
                                    properties: {
                                    }
                                }
                            }
                        }
                    }
                };

                stylesFixer.exec(page);

                expect(page.data.theme_data.txtNew).toEqual({
                    type: 'TopLevelStyle',
                    id: 'txtNew',
                    metaData: {
                        isPreset: true,
                        schemaVersion: '1.0',
                        isHidden: false
                    },
                    styleType: 'system',
                    skin: 'wysiwyg.viewer.skins.WRichTextNewSkin',
                    style: {
                        properties: {},
                        "propertiesSource": {
                        },
                        groups: {}
                    }
                });
            });

            describe('Fix txtNew skin:', function () {
                beforeEach(function () {
                    openExperiments('migrateTextStyle');
                });

                it('Should fix the txtNewSkin', function () {
                    var page = {
                        data: {
                            theme_data: {
                                txtNew: {
                                    type: 'TopLevelStyle',
                                    id: 'txtNew',
                                    metaData: {
                                        isPreset: true,
                                        schemaVersion: '1.0',
                                        isHidden: false
                                    },
                                    styleType: 'system',
                                    skin: 'wysiwyg.viewer.skins.WRichTextSkin',
                                    style: {
                                        properties: {},
                                        "propertiesSource": {},
                                        groups: {}
                                    }
                                }
                            }
                        }
                    };

                    var _stylesFixer = stylesFixerDef(_, experiment);
                    _stylesFixer.exec(page);

                    expect(page.data.theme_data.txtNew.skin).toEqual('wysiwyg.viewer.skins.WRichTextNewSkin');
                });
            });
        });
    });
});
