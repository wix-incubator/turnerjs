/**
 * Created by eitanr on 11/17/14.
 */
define(['skins/util/params', 'color', 'lodash'], function (params, color, _) {
    'use strict';

    describe('params specs', function () {
        describe('empty results', function () {
            it('should return an empty string if there are no params in the skin', function () {
                var param = params.renderParam('theParamName', {}, {}, {});
                expect(param).toBe('');
            });

            it('should return en empty string if there is no default value for the param, and it is not specified in the styleData', function () {
                var param = params.renderParam('theParamName', {
                    paramsDefault: {}
                }, {}, {});
                expect(param).toBe('');
            });

            it('should return an empty string if the param type is not defined', function () {
                var param = params.renderParam('theParamName', {
                    params: {},
                    paramsDefaults: {}
                }, {}, {});

                expect(param).toBe('');
            });
        });

        describe('param types specs', function () {
            describe('render FONT params', function () {
                it('should render a param of type FONT with default value, if not defined in styleData', function () {
                    var param = params.renderParam('someFontParamName', {
                        params: {
                            "someFontParamName": "FONT"
                        },
                        paramsDefaults: {
                            "someFontParamName": "theParamValue"
                        }
                    }, {}, {});

                    expect(param).toEqual({
                        type: 'FONT',
                        value: 'theParamValue'
                    });
                });

                it('should render a param of type FONT with value defined in styleData, if specified', function () {
                    var styleData = {
                        "someFontParamName": "theStyleValue"
                    };

                    var paramsTypes = {
                        "someFontParamName": "FONT"
                    };

                    var paramsDefaults = {
                        "someFontParamName": "theDefaultValue"
                    };

                    var param = params.renderParam('someFontParamName', {
                        params: paramsTypes,
                        paramsDefaults: paramsDefaults
                    }, styleData, {});

                    expect(param.value).toBe('theStyleValue');
                });
            });

            describe('render SIZE params', function () {
                it('should render a param of type SIZE with default value, if not defined in styleData', function () {
                    var param = params.renderParam('someSizeParamName', {
                        params: {
                            "someSizeParamName": "SIZE"
                        },
                        paramsDefaults: {
                            "someSizeParamName": "theParamValue"
                        }
                    }, {}, {});

                    expect(param).toEqual({
                        type: 'SIZE',
                        value: 'theParamValue'
                    });
                });

                it('should render a param of type SIZE with value defined in styleData, if specified', function () {
                    var styleData = {
                        "someSizeParamName": "theStyleValue"
                    };

                    var paramsTypes = {
                        "someSizeParamName": "SIZE"
                    };

                    var paramsDefaults = {
                        "someSizeParamName": "theDefaultValue"
                    };

                    var param = params.renderParam('someSizeParamName', {
                        params: paramsTypes,
                        paramsDefaults: paramsDefaults
                    }, styleData, {});

                    expect(param.value).toBe('theStyleValue');
                });

                it('should render zero values if value defined in styleData is zero', function () {
                    var styleData = {
                        "someSizeParamName": 0
                    };

                    var paramsTypes = {
                        "someSizeParamName": "SIZE"
                    };

                    var paramsDefaults = {
                        "someSizeParamName": 5
                    };

                    var param = params.renderParam('someSizeParamName', {
                        params: paramsTypes,
                        paramsDefaults: paramsDefaults
                    }, styleData, {});

                    expect(param.value).toBe(0);
                });
                //case "SIZE":
                //case "TRANSITION":
                //case "INVERTED_ZOOM":
                //case "INVERTED_ZOOM_FIXED":
                //case "ORIENTATION_ZOOM_FIX":
                //case "URL":
            });

            describe('render TRANSITION params', function () {
                it('should render a param of type TRANSITION with default value, if not defined in styleData', function () {
                    var param = params.renderParam('someTransitionParamName', {
                        params: {
                            "someTransitionParamName": "TRANSITION"
                        },
                        paramsDefaults: {
                            "someTransitionParamName": "theParamValue"
                        }
                    }, {}, {});

                    expect(param).toEqual({
                        type: 'TRANSITION',
                        value: 'theParamValue'
                    });
                });

                it('should render a param of type TRANSITION with value defined in styleData, if specified', function () {
                    var styleData = {
                        "someTransitionParamName": "theStyleValue"
                    };

                    var paramsTypes = {
                        "someTransitionParamName": "TRANSITION"
                    };

                    var paramsDefaults = {
                        "someTransitionParamName": "theDefaultValue"
                    };

                    var param = params.renderParam('someTransitionParamName', {
                        params: paramsTypes,
                        paramsDefaults: paramsDefaults
                    }, styleData, {});

                    expect(param.value).toBe('theStyleValue');
                });
            });

            describe('render INVERTED_ZOOM params', function () {
                it('should render a param of type INVERTED_ZOOM with default value, if not defined in styleData', function () {
                    var param = params.renderParam('zoomParamName', {
                        params: {
                            "zoomParamName": "INVERTED_ZOOM"
                        },
                        paramsDefaults: {
                            "zoomParamName": "theParamValue"
                        }
                    }, {}, {});

                    expect(param).toEqual({
                        type: 'INVERTED_ZOOM',
                        value: 'theParamValue'
                    });
                });

                it('should render a param of type INVERTED_ZOOM with value defined in styleData, if specified', function () {
                    var styleData = {
                        "zoomParamName": "theStyleValue"
                    };

                    var paramsTypes = {
                        "zoomParamName": "INVERTED_ZOOM"
                    };

                    var paramsDefaults = {
                        "zoomParamName": "theDefaultValue"
                    };

                    var param = params.renderParam('zoomParamName', {
                        params: paramsTypes,
                        paramsDefaults: paramsDefaults
                    }, styleData, {});

                    expect(param.value).toBe('theStyleValue');
                });

                //case "INVERTED_ZOOM":
                //case "INVERTED_ZOOM_FIXED":
                //case "ORIENTATION_ZOOM_FIX":
                //case "URL":
            });

            describe('render INVERTED_ZOOM_FIXED params', function () {
                it('should render a param of type INVERTED_ZOOM_FIXED with default value, if not defined in styleData', function () {
                    var param = params.renderParam('zoomParamName', {
                        params: {
                            "zoomParamName": "INVERTED_ZOOM_FIXED"
                        },
                        paramsDefaults: {
                            "zoomParamName": "theParamValue"
                        }
                    }, {}, {});

                    expect(param).toEqual({
                        type: 'INVERTED_ZOOM_FIXED',
                        value: 'theParamValue'
                    });
                });

                it('should render a param of type INVERTED_ZOOM_FIXED with value defined in styleData, if specified', function () {
                    var styleData = {
                        "zoomParamName": "theStyleValue"
                    };

                    var paramsTypes = {
                        "zoomParamName": "INVERTED_ZOOM_FIXED"
                    };

                    var paramsDefaults = {
                        "zoomParamName": "theDefaultValue"
                    };

                    var param = params.renderParam('zoomParamName', {
                        params: paramsTypes,
                        paramsDefaults: paramsDefaults
                    }, styleData, {});

                    expect(param.value).toBe('theStyleValue');
                });
            });

            describe('render ORIENTATION_ZOOM_FIX params', function () {
                it('should render a param of type ORIENTATION_ZOOM_FIX with default value, if not defined in styleData', function () {
                    var param = params.renderParam('zoomParamName', {
                        params: {
                            "zoomParamName": "ORIENTATION_ZOOM_FIX"
                        },
                        paramsDefaults: {
                            "zoomParamName": "theParamValue"
                        }
                    }, {}, {});

                    expect(param).toEqual({
                        type: 'ORIENTATION_ZOOM_FIX',
                        value: 'theParamValue'
                    });
                });

                it('should render a param of type ORIENTATION_ZOOM_FIX with value defined in styleData, if specified', function () {
                    var styleData = {
                        "zoomParamName": "theStyleValue"
                    };

                    var paramsTypes = {
                        "zoomParamName": "ORIENTATION_ZOOM_FIX"
                    };

                    var paramsDefaults = {
                        "zoomParamName": "theDefaultValue"
                    };

                    var param = params.renderParam('zoomParamName', {
                        params: paramsTypes,
                        paramsDefaults: paramsDefaults
                    }, styleData, {});

                    expect(param.value).toBe('theStyleValue');
                });
            });

            describe('render URL params', function () {
                it('should render a param of type URL with default value, if not defined in styleData', function () {
                    var param = params.renderParam('urlParamName', {
                        params: {
                            "urlParamName": "URL"
                        },
                        paramsDefaults: {
                            "urlParamName": "theParamValue"
                        }
                    }, {}, {});

                    expect(param).toEqual({
                        type: 'URL',
                        value: 'theParamValue'
                    });
                });

                it('should render a param of type URL with value defined in styleData, if specified', function () {
                    var styleData = {
                        "urlParamName": "theStyleValue"
                    };

                    var paramsTypes = {
                        "urlParamName": "URL"
                    };

                    var paramsDefaults = {
                        "urlParamName": "theDefaultValue"
                    };

                    var param = params.renderParam('urlParamName', {
                        params: paramsTypes,
                        paramsDefaults: paramsDefaults
                    }, styleData, {});

                    expect(param.value).toBe('theStyleValue');
                });
            });

            describe('render BORDER_RADIUS params', function () {
                it('should render a param of type BORDER_RADIUS with default value, if not defined in styleData', function () {
                    var param = params.renderParam('borderRadiusParamName', {
                        params: {
                            "borderRadiusParamName": "BORDER_RADIUS"
                        },
                        paramsDefaults: {
                            "borderRadiusParamName": "0"
                        }
                    }, {}, {});

                    expect(param).toEqual({
                        type: 'BORDER_RADIUS',
                        value: '0'
                    });
                });

                it('should render a param of type BORDER_RADIUS with value defined in styleData, if specified', function () {
                    var styleData = {
                        "borderRadiusParamName": "10px"
                    };

                    var paramsTypes = {
                        "borderRadiusParamName": "BORDER_RADIUS"
                    };

                    var paramsDefaults = {
                        "borderRadiusParamName": "5px"
                    };

                    var param = params.renderParam('borderRadiusParamName', {
                        params: paramsTypes,
                        paramsDefaults: paramsDefaults
                    }, styleData, {});

                    expect(param.value).toBe('10px');
                });


                it('should limit BORDER_RADIUS param value specified in the styleData to be max 99999 due to FF and IE support limitation', function () {
                    var styleData = {
                        "borderRadiusParamName": "100000px"
                    };

                    var paramsTypes = {
                        "borderRadiusParamName": "BORDER_RADIUS"
                    };

                    var paramsDefaults = {
                        "borderRadiusParamName": "5px"
                    };

                    var param = params.renderParam('borderRadiusParamName', {
                        params: paramsTypes,
                        paramsDefaults: paramsDefaults
                    }, styleData, {});

                    expect(param.value).toBe('99999px');
                });
            });

            describe('render BOX_SHADOW params', function () {
                it('should render a param of type BOX_SHADOW with default value, if not defined in styleData', function () {
                    var param = params.renderParam('boxShadowParamName', {
                        params: {
                            "boxShadowParamName": "BOX_SHADOW"
                        },
                        paramsDefaults: {
                            "boxShadowParamName": "defaultValue"
                        }
                    }, {}, {});

                    expect(param).toEqual({
                        type: 'BOX_SHADOW',
                        value: 'defaultValue'
                    });
                });

                it('should render a param of type BOX_SHADOW with value defined in styleData, if specified', function () {
                    var styleData = {
                        "boxShadowParamName": "styleDataValue"
                    };

                    var paramsTypes = {
                        "boxShadowParamName": "BOX_SHADOW"
                    };

                    var paramsDefaults = {
                        "boxShadowParamName": "defaultValue"
                    };

                    var param = params.renderParam('boxShadowParamName', {
                        params: paramsTypes,
                        paramsDefaults: paramsDefaults
                    }, styleData, {});

                    expect(param.value).toBe('styleDataValue');
                });

                it('should return an empty string if BOX_SHADOW toggle is configured as false in the styleData', function () {
                    var styleData = {
                        "boxShadowParamName": "styleDataValue",
                        'boxShadowToggleOn-boxShadowParamName': 'false'
                    };

                    var paramsTypes = {
                        "boxShadowParamName": "BOX_SHADOW"
                    };

                    var paramsDefaults = {
                        "boxShadowParamName": "defaultValue"
                    };

                    var param = params.renderParam('boxShadowParamName', {
                        params: paramsTypes,
                        paramsDefaults: paramsDefaults
                    }, styleData, {});

                    expect(param).toBe('');
                });

                it('should return an empty string if BOX_SHADOW toggle is configured as false in the params default values', function () {
                    var param = params.renderParam('boxShadowParamName', {
                        params: {
                            "boxShadowParamName": "BOX_SHADOW"
                        },
                        paramsDefaults: {
                            "boxShadowParamName": "defaultValue",
                            'boxShadowToggleOn-boxShadowParamName': 'false'
                        }
                    }, {}, {});

                    expect(param).toBe('');
                });
            });
        });

        describe('Color param types', function () {
            var colorTypes = ["BG_COLOR", "COLOR", "COLOR_ALPHA"];

            it('should render a param of the color types with a default color with actual value, if not defined in styleData', function () {
                _.forEach(colorTypes, function(paramType) {
                    var param = params.renderParam('bgColorParamName', {
                        params: {
                            "bgColorParamName": paramType
                        },
                        paramsDefaults: {
                            "bgColorParamName": "#F3F3F3"
                        }
                    }, {}, {});

                    expect(param).toEqual({
                        type: paramType,
                        value: color("#F3F3F3")
                    });
                });
            });

            it('should render a param of the color types with a default color that is a wix color, if not defined in styleData', function () {
                _.forEach(colorTypes, function(paramType) {
                    var param = params.renderParam('bgColorParamName', {
                        params: {
                            "bgColorParamName": paramType
                        },
                        paramsDefaults: {
                            "bgColorParamName": "color_12"
                        }
                    }, {}, {12: "#F3F3F3"});

                    expect(param).toEqual({
                        type: paramType,
                        value: color("#F3F3F3")
                    });
                });
            });

            it('should render a param of the color types with value defined in styleData, if specified', function () {
                _.forEach(colorTypes, function(paramType) {
                    var styleData = {
                        "bgColorParamName": "#F3F3F3"
                    };

                    var paramsTypes = {
                        "bgColorParamName": paramType
                    };

                    var paramsDefaults = {
                        "bgColorParamName": "defaultValue"
                    };

                    var param = params.renderParam('bgColorParamName', {
                        params: paramsTypes,
                        paramsDefaults: paramsDefaults
                    }, styleData, {});

                    expect(param).toEqual({
                        type: paramType,
                        value: color("#F3F3F3")
                    });
                });
            });
        });

        describe('Params with mutators', function () {
            describe('SIZE params with mutators', function () {
                it('decrease mutator', function () {
                    var param = params.renderParam('someSizeParamName', {
                        params: {
                            "someSizeParamName": "SIZE"
                        },
                        paramsDefaults: {
                            "someSizeParamName": 100
                        },
                        paramsMutators: {
                            "someSizeParamName": [["decrease", 10]]
                        }
                    }, {}, {});

                    expect(param).toEqual({
                        type: 'SIZE',
                        value: 90
                    });
                });

                it('increase mutator', function () {
                    var param = params.renderParam('someSizeParamName', {
                        params: {
                            "someSizeParamName": "SIZE"
                        },
                        paramsDefaults: {
                            "someSizeParamName": 100
                        },
                        paramsMutators: {
                            "someSizeParamName": [["increase", 10]]
                        }
                    }, {}, {});

                    expect(param).toEqual({
                        type: 'SIZE',
                        value: 110
                    });
                });

                it('multiply mutator', function () {
                    var param = params.renderParam('someSizeParamName', {
                        params: {
                            "someSizeParamName": "SIZE"
                        },
                        paramsDefaults: {
                            "someSizeParamName": 100
                        },
                        paramsMutators: {
                            "someSizeParamName": [["multiply", 0.5]]
                        }
                    }, {}, {});

                    expect(param).toEqual({
                        type: 'SIZE',
                        value: 50
                    });
                });

                it('max mutator', function () {
                    var param = params.renderParam('someSizeParamName', {
                        params: {
                            "someSizeParamName": "SIZE"
                        },
                        paramsDefaults: {
                            "someSizeParamName": 100
                        },
                        paramsMutators: {
                            "someSizeParamName": [["max", 266]]
                        }
                    }, {}, {});

                    expect(param).toEqual({
                        type: 'SIZE',
                        value: 266
                    });

                    param = params.renderParam('someSizeParamName', {
                        params: {
                            "someSizeParamName": "SIZE"
                        },
                        paramsDefaults: {
                            "someSizeParamName": 100
                        },
                        paramsMutators: {
                            "someSizeParamName": [["max", 66]]
                        }
                    }, {}, {});

                    expect(param).toEqual({
                        type: 'SIZE',
                        value: 100
                    });
                });
                it('eval mutator', function () {
                    var param = params.renderParam('someSizeParamName', {
                        params: {
                            "someSizeParamName": "SIZE"
                        },
                        paramsDefaults: {
                            "someSizeParamName": 17
                        },
                        paramsMutators: {
                            "someSizeParamName": [["eval", "(someSizeParamName - 1) % 10"]]
                        }
                    }, {}, {}, {"(someSizeParamName - 1) % 10": function(someSizeParamName) { return (someSizeParamName - 1) % 10; }});

                    expect(param).toEqual({
                        type: 'SIZE',
                        value: 6
                    });
                });

            });

            describe('COLOR params with mutators', function () {
                var colorTypes = ["BG_COLOR", "COLOR", "COLOR_ALPHA"];

                it('brightness mutator - brightness should be applied to the color value', function () {
                    var param = params.renderParam('colorParamName', {
                        params: {
                            "colorParamName": "COLOR"
                        },
                        paramsDefaults: {
                            "colorParamName": "#F3F3F3"
                        },
                        paramsMutators: {
                            "colorParamName": [["brightness", 0.7]]
                        }
                    }, {}, {});

                    var value = color("#F3F3F3");
                    expect(param).toEqual({
                        type: "COLOR",
                        value: value.value(0.7 * value.hsv().v)
                    });
                });

                describe('alpha mutator', function () {
                    //check multiple alphas, mapped params, etc
                    it('simple case where an alpha mutator should be applied to the color value', function () {
                        _.forEach(colorTypes, function(paramType) {
                            var param = params.renderParam('colorParamName', {
                                params: {
                                    "colorParamName": paramType
                                },
                                paramsDefaults: {
                                    "colorParamName": "#F3F3F3"
                                },
                                paramsMutators: {
                                    "colorParamName": [
                                        ["alpha", 0.75]
                                    ]
                                }
                            }, {}, {});

                            var value = color("#F3F3F3");
                            expect(param).toEqual({
                                type: paramType,
                                value: value.alpha(0.75)
                            });
                        });
                    });

                    it('should render alpha transparent when alpha-paramName is zero in the styleData', function () {
                        var param = params.renderParam('colorParamName', {
                            params: {
                                "colorParamName": 'BG_COLOR'
                            },
                            paramsDefaults: {
                                "colorParamName": "#F3F3F3"
                            }
                        }, {
                            "alpha-colorParamName": 0
                        }, {});

                        expect(param.value.alpha()).toEqual(0);

                    });

                    it('mapped param should be mutated with a multiply of it own alpha and its mapped param alpha', function () {
                        _.forEach(colorTypes, function(paramType) {
                            var paramsTypes = {
                                "bgParamName": paramType,
                                "bg2ParamName": paramType
                            };

                            var paramsDefaults = {
                                "bgParamName": "170,168,168,0.5",
                                "bg2ParamName": ["bgParamName"]
                            };

                            var param = params.renderParam('bg2ParamName', {
                                params: paramsTypes,
                                paramsDefaults: paramsDefaults,
                                paramsMutators: {bg2ParamName: {alpha: 0.5}}
                            }, {'alpha-bgParamName': 0.5}, {});

                            expect(param).toEqual({
                                type: paramType,
                                value: color("rgba(170,168,168,0.25)")
                            });
                        });
                    });
                });
            });

            describe('mutators for default only', function () {
                it('param does not exist in styleData - should apply the mutator to the dependant param name', function () {
                    var styleData = {otherParamName: '#F3F3F3'};
                    var param = params.renderParam('colorParamName', {
                        params: {
                            "colorParamName": "COLOR"
                        },
                        paramsDefaults: {
                            "colorParamName": ["otherParamName"]
                        },
                        paramsMutators: {
                            "colorParamName": [["brightness", 0.7, true]]
                        }
                    }, styleData, {});

                    var value = color("#F3F3F3");
                    expect(param).toEqual({
                        type: "COLOR",
                        value: value.value(0.7 * value.hsv().v)
                    });
                });
                it('param does exist in styleData - should take the param style without the mutation', function () {
                    var styleData = {
                        otherParamName: '#F3F3F3',
                        colorParamName: '#FFFFFF'
                    };
                    var param = params.renderParam('colorParamName', {
                        params: {
                            "colorParamName": "COLOR"
                        },
                        paramsDefaults: {
                            "colorParamName": ["otherParamName"]
                        },
                        paramsMutators: {
                            "colorParamName": [["brightness", 0.7, true]]
                        }
                    }, styleData, {});

                    expect(param).toEqual({
                        type: "COLOR",
                        value: color("#FFFFFF")
                    });
                });
            });
        });
    });
});
