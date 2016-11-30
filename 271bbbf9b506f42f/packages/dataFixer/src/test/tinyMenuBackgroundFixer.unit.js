define([
    'lodash',
    'dataFixer/plugins/tinyMenuSkinBackgroundFixer'
], function (_, tinyMenuSkinBackroundFixer) {

    'use strict';

    function expectInputTransformation(input, output) {
        tinyMenuSkinBackroundFixer.exec(input);
        expect(input).toEqual(output);
    }

    describe('When there is missing data', function () {
        describe('When properties are undefined', function () {
            it('Should not change the missing values', function () {
                expectInputTransformation({
                    data: {
                        theme_data: [
                            {
                                skin: "wysiwyg.viewer.skins.mobile.TinyMenuSkin",
                                style: {
                                    properties: undefined,
                                    propertiesSource: undefined
                                }
                            }
                        ]
                    }
                }, {
                    data: {
                        theme_data: [
                            {
                                skin: "wysiwyg.viewer.skins.mobile.TinyMenuSkin",
                                style: {
                                    properties: undefined,
                                    propertiesSource: undefined
                                }
                            }
                        ]
                    }

                });
            });
        });


        describe('When properties have some missing values', function () {
            it('Should not create missing undefined values', function () {
                expectInputTransformation({
                    data: {
                        theme_data: [
                            {
                                skin: "wysiwyg.viewer.skins.mobile.TinyMenuSkin",
                                style: {
                                    properties: {txt: "1"},
                                    propertiesSource: {}
                                }
                            }
                        ]
                    }
                }, {
                    data: {
                        theme_data: [
                            {
                                skin: "wysiwyg.viewer.skins.mobile.TinyMenuSkin",
                                style: {
                                    properties: {txt: "1", bordercolor: "1", iconcolor: "1", borderColorSelected: "1"},
                                    propertiesSource: {}
                                }
                            }
                        ]
                    }

                });
            });
        });

        describe('When properties are empty', function () {
            it('Should not change the missing values', function () {
                expectInputTransformation({
                    data: {
                        theme_data: [
                            {
                                skin: "wysiwyg.viewer.skins.mobile.TinyMenuSkin",
                                style: {
                                    properties: {},
                                    propertiesSource: {}
                                }
                            }
                        ]
                    }
                }, {
                    data: {
                        theme_data: [
                            {
                                skin: "wysiwyg.viewer.skins.mobile.TinyMenuSkin",
                                style: {
                                    properties: {},
                                    propertiesSource: {}
                                }
                            }
                        ]
                    }

                });
            });
        });
    });

    describe('tinyMenuPreserveOldData', function () {
        it('should ensure sites with old data would have correct values for new skin properties', function () {
            expectInputTransformation({
                data: {
                    theme_data: [
                        {
                            skin: "wysiwyg.viewer.skins.mobile.TinyMenuSkin",
                            style: {
                                properties: {
                                    txt: "1",
                                    bg: "2",
                                    "alpha-txt": 0.5,
                                    "alpha-bg": 0.1
                                },
                                propertiesSource: {
                                    "txt": "theme",
                                    "bg": "theme",
                                    "alpha-txt": "value",
                                    "alpha-bg": "value"
                                }
                            }
                        }
                    ]
                }
            }, {
                data: {
                    theme_data: [
                        {
                            skin: "wysiwyg.viewer.skins.mobile.TinyMenuSkin",
                            style: {
                                properties: {
                                    bg: "2",
                                    bgDrop: "2",
                                    bgOpen: "2",
                                    txt: "1",
                                    iconcolor: "1",
                                    bordercolor: "1",
                                    borderColorSelected: "1",
                                    "alpha-bg": 0.1,
                                    "alpha-bgDrop": 0.1,
                                    "alpha-bgOpen": 0.1,
                                    "alpha-txt": 0.5,
                                    "alpha-bordercolor": 0.5,
                                    "alpha-borderColorSelected": 0.5,
                                    "alpha-iconcolor": 0.5
                                },
                                propertiesSource: {
                                    bg: "theme",
                                    bgDrop: "theme",
                                    bgOpen: "theme",
                                    iconcolor: "theme",
                                    txt: "theme",
                                    bordercolor: "theme",
                                    borderColorSelected: "theme",
                                    "alpha-bg": "value",
                                    "alpha-bgOpen": "value",
                                    "alpha-bgDrop": "value",
                                    "alpha-txt": "value",
                                    "alpha-bordercolor": "value",
                                    "alpha-borderColorSelected": "value",
                                    "alpha-iconcolor": "value"
                                }
                            }
                        }
                    ]
                }

            });
        });
    });

    describe('tinyMenuDontOverrideNewData', function () {
        it('should ensure we dont override new skin properties', function () {
            expectInputTransformation({
                data: {
                    theme_data: [
                        {
                            skin: "wysiwyg.viewer.skins.mobile.TinyMenuSkin",
                            style: {
                                properties: {
                                    txt: "1",
                                    bg: "2",
                                    bgDrop: "3",
                                    bordercolor: "4",
                                    "alpha-txt": 0.5,
                                    "alpha-bg": 0.1,
                                    "alpha-bordercolor": 0.8
                                },
                                propertiesSource: {
                                    "txt": "theme",
                                    "bg": "theme",
                                    "alpha-txt": "value",
                                    "alpha-bg": "value"
                                }
                            }
                        }
                    ]
                }
            }, {
                data: {
                    theme_data: [
                        {
                            skin: "wysiwyg.viewer.skins.mobile.TinyMenuSkin",
                            style: {
                                properties: {
                                    bg: "2",
                                    bgDrop: "3",
                                    bgOpen: "2",
                                    txt: "1",
                                    iconcolor: "1",
                                    bordercolor: "4",
                                    borderColorSelected: "4",
                                    "alpha-bg": 0.1,
                                    "alpha-bgOpen": 0.1,
                                    "alpha-bgDrop": 0.1,
                                    "alpha-txt": 0.5,
                                    "alpha-bordercolor": 0.8,
                                    "alpha-borderColorSelected": 0.8,
                                    "alpha-iconcolor": 0.5
                                },
                                propertiesSource: {
                                    bg: "theme",
                                    bgDrop: "theme",
                                    bgOpen: "theme",
                                    iconcolor: "theme",
                                    txt: "theme",
                                    bordercolor: "theme",
                                    borderColorSelected: "theme",
                                    "alpha-bg": "value",
                                    "alpha-bgOpen": "value",
                                    "alpha-bgDrop": "value",
                                    "alpha-txt": "value",
                                    "alpha-bordercolor": "value",
                                    "alpha-borderColorSelected": "value",
                                    "alpha-iconcolor": "value"
                                }
                            }
                        }
                    ]
                }

            });
        });
    });
});
