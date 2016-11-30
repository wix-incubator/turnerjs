define(['lodash', 'documentServices/wixapps/utils/appPart2LayoutUtils', 'documentServices/mockPrivateServices/privateServicesHelper', 'documentServices/component/component', 'documentServices/structure/structure'], function (_, appPart2LayoutUtils, privateServicesHelper, component, structure) {
    'use strict';

    var viewDef, field1, autoWidthTextField1, fixedWidthTextField1;

    describe('appPart2LayoutUtils', function () {

        beforeEach(function () {
            field1 = {
                "id": "fld_i70hnc0q267",
                "data": "i6rnai1n",
                "comp": {
                    "width": 100,
                    "spacers": {
                        "before": 1,
                        "after": 2,
                        "xax-before": 3,
                        "xax-after": 4
                    },
                    "hidden": false,
                    "name": "Field",
                    "labelPosition": "none",
                    "height": 200,
                    "box-align": "left"
                }
            };

            autoWidthTextField1 = {
                "id": "fld_hfnxgxqo",
                "data": "Strng_sTxt1",
                "comp": {
                    "min-lines": "0",
                    "width": "150",
                    "spacers": {
                        "before": 5,
                        "after": 6,
                        "xax-before": 7,
                        "xax-after": 8
                    },
                    "width-mode": "auto",
                    "name": "TextField",
                    "max-lines": "0",
                    "hidden": false,
                    "labelPosition": "none"
                }
            };

            fixedWidthTextField1 = _.merge({}, autoWidthTextField1, {comp: {'width-mode': 'manual'}});

            viewDef = {
                "id": "Center",
                "comp": {
                    "name": "FieldBox",
                    "items": [
                        field1,
                        autoWidthTextField1,
                        fixedWidthTextField1
                    ]
                }
            };

        });

        describe('getAppPart2MinWidth - integration', function () {
            var itemDef1 = {
                "name": "NewsPostsView_i6cku5qn358_dup_i6m55rw984_dup_i6qm3pb3334_dup_i6rnvu26122_dup_i70h8xjn180_dup_i7ek4nze1_i9sfibhe",
                "forType": "NewsPosts_i6cku5qm357_i9sfibhd",
                "comp": {
                    "name": "VBox",
                    "items": [
                        {
                            "id": "Top",
                            "comp": {
                                "name": "FieldBox",
                                "orientation": "vertical",
                                "editorData": {
                                    "labelPosition": "none",
                                    "displayName": "Top section",
                                    "alignment": "left",
                                    "spacers": {
                                        "before": 0,
                                        "after": 3,
                                        "xax-before": 0,
                                        "xax-after": 3
                                    }
                                },
                                "items": []
                            },
                            "layout": {
                                "min-width": 0
                            }
                        },
                        {
                            "id": "topSpacer",
                            "comp": {
                                "name": "VSpacer",
                                "size": "0"
                            }
                        },
                        {
                            "comp": {
                                "name": "HBox",
                                "items": [
                                    {
                                        "id": "Left",
                                        "comp": {
                                            "name": "FieldBox",
                                            "orientation": "horizontal",
                                            "items": [
                                                {
                                                    "id": "fld_i70imvqs465",
                                                    "data": "i6ckxtsf",
                                                    "comp": {
                                                        "name": "Field",
                                                        "width": 330,
                                                        "height": 227,
                                                        "items": [
                                                            {
                                                                "id": "fld_i70imvqs465_proxy",
                                                                "data": "i6ckxtsf",
                                                                "comp": {
                                                                    "name": "Video"
                                                                },
                                                                "layout": {
                                                                    "position": "relative"
                                                                }
                                                            }
                                                        ],
                                                        "hidden": true,
                                                        "labelPosition": "none",
                                                        "spacers": {
                                                            "before": 0,
                                                            "after": 30,
                                                            "xax-before": 0,
                                                            "xax-after": 0
                                                        },
                                                        "box-align": "left"
                                                    }
                                                },
                                                {
                                                    "id": "fld_i6m58mzj129",
                                                    "data": "image",
                                                    "comp": {
                                                        "name": "Field",
                                                        "width": 330,
                                                        "height": 227,
                                                        "items": [
                                                            {
                                                                "id": "fld_i6m58mzj129_proxy",
                                                                "data": "image",
                                                                "comp": {
                                                                    "name": "Image",
                                                                    "style": "wp2"
                                                                }
                                                            }
                                                        ],
                                                        "hidden": false,
                                                        "labelPosition": "none",
                                                        "spacers": {
                                                            "before": 0,
                                                            "after": 30,
                                                            "xax-before": 0,
                                                            "xax-after": 0
                                                        },
                                                        "box-align": "left"
                                                    }
                                                }
                                            ],
                                            "editorData": {
                                                "labelPosition": "none",
                                                "alignment": "left",
                                                "displayName": "Left section",
                                                "spacers": {
                                                    "before": 0,
                                                    "after": 3,
                                                    "xax-before": 0,
                                                    "xax-after": 20
                                                }
                                            },
                                            "pack": "start"
                                        },
                                        "layout": {
                                            "spacerAfter": 0,
                                            "min-width": 0
                                        }
                                    },
                                    {
                                        "id": "leftToCenterSpacer",
                                        "comp": {
                                            "name": "HSpacer",
                                            "size": "0"
                                        }
                                    },
                                    {
                                        "id": "Center",
                                        "comp": {
                                            "name": "FieldBox",
                                            "orientation": "vertical",
                                            "items": [
                                                {
                                                    "id": "text_1",
                                                    "data": "title",
                                                    "comp": {
                                                        "items": [
                                                            {
                                                                "id": "text_1_proxy",
                                                                "data": "title",
                                                                "comp": {
                                                                    "name": "Label",
                                                                    "style": "Heading S",
                                                                    "bold": false,
                                                                    "italic": false,
                                                                    "underline": false
                                                                },
                                                                "layout": {
                                                                    "text-align": "left"
                                                                }
                                                            }
                                                        ],
                                                        "box-align": "start",
                                                        "min-lines": 0,
                                                        "width": "200",
                                                        "spacers": {
                                                            "before": 0,
                                                            "after": 0,
                                                            "xax-before": 0
                                                        },
                                                        "height-mode": "auto",
                                                        "width-mode": "auto",
                                                        "name": "TextField",
                                                        "max-lines": 0
                                                    }
                                                },
                                                {
                                                    "id": "fld_hfnxgxqo",
                                                    "data": "Strng_sTxt1",
                                                    "comp": {
                                                        "items": [
                                                            {
                                                                "id": "fld_hfnxgxqo_proxy",
                                                                "data": "Strng_sTxt1",
                                                                "comp": {
                                                                    "name": "Label",
                                                                    "style": "Body S",
                                                                    "bold": false,
                                                                    "italic": true
                                                                },
                                                                "layout": {
                                                                    "text-align": "left"
                                                                }
                                                            }
                                                        ],
                                                        "min-lines": "0",
                                                        "width": "200",
                                                        "spacers": {
                                                            "before": 0,
                                                            "after": 0,
                                                            "xax-before": 0,
                                                            "xax-after": 0
                                                        },
                                                        "width-mode": "auto",
                                                        "hidden": false,
                                                        "name": "TextField",
                                                        "max-lines": "0",
                                                        "labelPosition": "none"
                                                    }
                                                },
                                                {
                                                    "id": "fld_hfxs75de",
                                                    "data": "wxRchTxt_sTxt0",
                                                    "comp": {
                                                        "items": [
                                                            {
                                                                "id": "fld_hfxs75de_proxy",
                                                                "data": "wxRchTxt_sTxt0",
                                                                "comp": {
                                                                    "name": "Label"
                                                                },
                                                                "layout": {
                                                                    "text-align": "left"
                                                                }
                                                            }
                                                        ],
                                                        "min-lines": "0",
                                                        "width": "200",
                                                        "spacers": {
                                                            "before": 10,
                                                            "after": 0,
                                                            "xax-before": 0,
                                                            "xax-after": 0
                                                        },
                                                        "width-mode": "auto",
                                                        "hidden": false,
                                                        "name": "TextField",
                                                        "max-lines": "0",
                                                        "labelPosition": "none"
                                                    }
                                                },
                                                {
                                                    "id": "fld_i70if2w4348",
                                                    "data": "Strng_sBttn0-v1c",
                                                    "comp": {
                                                        "name": "Field",
                                                        "width": 160,
                                                        "height": "40",
                                                        "items": [
                                                            {
                                                                "id": "fld_i70if2w4348_proxy",
                                                                "data": "Strng_sBttn0-v1c",
                                                                "comp": {
                                                                    "name": "Button2",
                                                                    "style": "b1",
                                                                    "align": "center"
                                                                },
                                                                "layout": {
                                                                    "position": "relative"
                                                                }
                                                            }
                                                        ],
                                                        "hidden": false,
                                                        "labelPosition": "none",
                                                        "spacers": {
                                                            "before": 20,
                                                            "after": 0,
                                                            "xax-before": 0,
                                                            "xax-after": 0
                                                        },
                                                        "box-align": "left"
                                                    }
                                                }
                                            ],
                                            "editorData": {
                                                "labelPosition": "none",
                                                "alignment": "left",
                                                "displayName": "Center section",
                                                "spacers": {
                                                    "before": 0,
                                                    "after": 3,
                                                    "xax-before": 0,
                                                    "xax-after": 0
                                                }
                                            },
                                            "pack": "start"
                                        },
                                        "layout": {
                                            "box-flex": 1,
                                            "min-width": 0
                                        }
                                    },
                                    {
                                        "id": "centerToRightSpacer",
                                        "comp": {
                                            "name": "HSpacer",
                                            "size": "3"
                                        }
                                    },
                                    {
                                        "id": "Right",
                                        "comp": {
                                            "name": "FieldBox",
                                            "orientation": "vertical",
                                            "editorData": {
                                                "labelPosition": "none",
                                                "displayName": "Right section",
                                                "alignment": "left",
                                                "spacers": {
                                                    "before": 0,
                                                    "after": 3,
                                                    "xax-before": 3,
                                                    "xax-after": 0
                                                }
                                            },
                                            "items": []
                                        },
                                        "layout": {
                                            "min-width": 0
                                        }
                                    }
                                ]
                            },
                            "id": "def_3"
                        },
                        {
                            "id": "Bottom",
                            "comp": {
                                "name": "FieldBox",
                                "orientation": "vertical",
                                "editorData": {
                                    "labelPosition": "none",
                                    "displayName": "Bottom section",
                                    "alignment": "left",
                                    "spacers": {
                                        "before": 0,
                                        "after": 3,
                                        "xax-before": 0,
                                        "xax-after": 3
                                    }
                                },
                                "items": [],
                                "pack": "start"
                            },
                            "layout": {
                                "box-flex-pack": "start",
                                "min-width": 0
                            }
                        },
                        {
                            "id": "bottomSpacer",
                            "comp": {
                                "name": "VSpacer",
                                "size": "0"
                            }
                        }
                    ]
                },
                "id": "def_0",
                "editorData": {
                    "wasChanged": true
                }
            };
            var itemDef2 = {
                "name": "NewsPostsView_i6cku5qn358_dup_i6m55rw984_dup_i6qm3pb3334_dup_i6rnvu26122_dup_i70h8xjn180_dup_i7ek4nze1_i9sfibhe",
                "forType": "NewsPosts_i6cku5qm357_i9sfibhd",
                "comp": {
                    "name": "VBox",
                    "items": [
                        {
                            "id": "Top",
                            "comp": {
                                "name": "FieldBox",
                                "orientation": "vertical",
                                "editorData": {
                                    "labelPosition": "none",
                                    "displayName": "Top section",
                                    "alignment": "left",
                                    "spacers": {
                                        "before": 0,
                                        "after": 3,
                                        "xax-before": 0,
                                        "xax-after": 3
                                    }
                                },
                                "items": [
                                    {
                                        "id": "fld_i70if2w4348",
                                        "data": "Strng_sBttn0-v1c",
                                        "comp": {
                                            "name": "Field",
                                            "width": 160,
                                            "height": "40",
                                            "items": [
                                                {
                                                    "id": "fld_i70if2w4348_proxy",
                                                    "data": "Strng_sBttn0-v1c",
                                                    "comp": {
                                                        "name": "Button2",
                                                        "style": "b1",
                                                        "align": "center"
                                                    },
                                                    "layout": {
                                                        "position": "relative"
                                                    }
                                                }
                                            ],
                                            "hidden": false,
                                            "labelPosition": "none",
                                            "spacers": {
                                                "before": 0,
                                                "after": 3,
                                                "xax-before": 0,
                                                "xax-after": 3
                                            },
                                            "box-align": "left"
                                        }
                                    }
                                ]
                            },
                            "layout": {
                                "min-width": 0
                            }
                        },
                        {
                            "id": "topSpacer",
                            "comp": {
                                "name": "VSpacer",
                                "size": "0"
                            }
                        },
                        {
                            "comp": {
                                "name": "HBox",
                                "items": [
                                    {
                                        "id": "Left",
                                        "comp": {
                                            "name": "FieldBox",
                                            "orientation": "horizontal",
                                            "items": [
                                                {
                                                    "id": "fld_i70imvqs465",
                                                    "data": "i6ckxtsf",
                                                    "comp": {
                                                        "name": "Field",
                                                        "width": 330,
                                                        "height": 227,
                                                        "items": [
                                                            {
                                                                "id": "fld_i70imvqs465_proxy",
                                                                "data": "i6ckxtsf",
                                                                "comp": {
                                                                    "name": "Video"
                                                                },
                                                                "layout": {
                                                                    "position": "relative"
                                                                }
                                                            }
                                                        ],
                                                        "hidden": false,
                                                        "labelPosition": "none",
                                                        "spacers": {
                                                            "before": 0,
                                                            "after": 30,
                                                            "xax-before": 0,
                                                            "xax-after": 0
                                                        },
                                                        "box-align": "left"
                                                    }
                                                },
                                                {
                                                    "id": "fld_i6m58mzj129",
                                                    "data": "image",
                                                    "comp": {
                                                        "name": "Field",
                                                        "width": 330,
                                                        "height": 227,
                                                        "items": [
                                                            {
                                                                "id": "fld_i6m58mzj129_proxy",
                                                                "data": "image",
                                                                "comp": {
                                                                    "name": "Image",
                                                                    "style": "wp2"
                                                                }
                                                            }
                                                        ],
                                                        "hidden": false,
                                                        "labelPosition": "none",
                                                        "spacers": {
                                                            "before": 0,
                                                            "after": 30,
                                                            "xax-before": 0,
                                                            "xax-after": 0
                                                        },
                                                        "box-align": "left"
                                                    }
                                                }
                                            ],
                                            "editorData": {
                                                "labelPosition": "none",
                                                "alignment": "left",
                                                "displayName": "Left section",
                                                "spacers": {
                                                    "before": 0,
                                                    "after": 3,
                                                    "xax-before": 0,
                                                    "xax-after": 20
                                                }
                                            },
                                            "pack": "start"
                                        },
                                        "layout": {
                                            "spacerAfter": 0,
                                            "min-width": 0
                                        }
                                    },
                                    {
                                        "id": "leftToCenterSpacer",
                                        "comp": {
                                            "name": "HSpacer",
                                            "size": "0"
                                        }
                                    },
                                    {
                                        "id": "Center",
                                        "comp": {
                                            "name": "FieldBox",
                                            "orientation": "vertical",
                                            "items": [
                                                {
                                                    "id": "text_1",
                                                    "data": "title",
                                                    "comp": {
                                                        "items": [
                                                            {
                                                                "id": "text_1_proxy",
                                                                "data": "title",
                                                                "comp": {
                                                                    "name": "Label",
                                                                    "style": "Heading S",
                                                                    "bold": false,
                                                                    "italic": false,
                                                                    "underline": false
                                                                },
                                                                "layout": {
                                                                    "text-align": "left"
                                                                }
                                                            }
                                                        ],
                                                        "box-align": "start",
                                                        "min-lines": 0,
                                                        "width": "200",
                                                        "spacers": {
                                                            "before": 0,
                                                            "after": 0,
                                                            "xax-before": 0
                                                        },
                                                        "height-mode": "auto",
                                                        "width-mode": "auto",
                                                        "name": "TextField",
                                                        "max-lines": 0
                                                    }
                                                },
                                                {
                                                    "id": "fld_hfnxgxqo",
                                                    "data": "Strng_sTxt1",
                                                    "comp": {
                                                        "items": [
                                                            {
                                                                "id": "fld_hfnxgxqo_proxy",
                                                                "data": "Strng_sTxt1",
                                                                "comp": {
                                                                    "name": "Label",
                                                                    "style": "Body S",
                                                                    "bold": false,
                                                                    "italic": true
                                                                },
                                                                "layout": {
                                                                    "text-align": "left"
                                                                }
                                                            }
                                                        ],
                                                        "min-lines": "0",
                                                        "width": "200",
                                                        "spacers": {
                                                            "before": 0,
                                                            "after": 0,
                                                            "xax-before": 0,
                                                            "xax-after": 0
                                                        },
                                                        "width-mode": "auto",
                                                        "hidden": false,
                                                        "name": "TextField",
                                                        "max-lines": "0",
                                                        "labelPosition": "none"
                                                    }
                                                },
                                                {
                                                    "id": "fld_hfxs75de",
                                                    "data": "wxRchTxt_sTxt0",
                                                    "comp": {
                                                        "items": [
                                                            {
                                                                "id": "fld_hfxs75de_proxy",
                                                                "data": "wxRchTxt_sTxt0",
                                                                "comp": {
                                                                    "name": "Label"
                                                                },
                                                                "layout": {
                                                                    "text-align": "left"
                                                                }
                                                            }
                                                        ],
                                                        "min-lines": "0",
                                                        "width": "200",
                                                        "spacers": {
                                                            "before": 10,
                                                            "after": 0,
                                                            "xax-before": 0,
                                                            "xax-after": 0
                                                        },
                                                        "width-mode": "auto",
                                                        "hidden": false,
                                                        "name": "TextField",
                                                        "max-lines": "0",
                                                        "labelPosition": "none"
                                                    }
                                                }
                                            ],
                                            "editorData": {
                                                "labelPosition": "none",
                                                "alignment": "left",
                                                "displayName": "Center section",
                                                "spacers": {
                                                    "before": 0,
                                                    "after": 3,
                                                    "xax-before": 0,
                                                    "xax-after": 0
                                                }
                                            },
                                            "pack": "start"
                                        },
                                        "layout": {
                                            "box-flex": 1,
                                            "min-width": 0
                                        }
                                    },
                                    {
                                        "id": "centerToRightSpacer",
                                        "comp": {
                                            "name": "HSpacer",
                                            "size": "3"
                                        }
                                    },
                                    {
                                        "id": "Right",
                                        "comp": {
                                            "name": "FieldBox",
                                            "orientation": "vertical",
                                            "editorData": {
                                                "labelPosition": "none",
                                                "displayName": "Right section",
                                                "alignment": "left",
                                                "spacers": {
                                                    "before": 0,
                                                    "after": 3,
                                                    "xax-before": 3,
                                                    "xax-after": 0
                                                }
                                            },
                                            "items": []
                                        },
                                        "layout": {
                                            "min-width": 0
                                        }
                                    }
                                ]
                            },
                            "id": "def_3"
                        },
                        {
                            "id": "Bottom",
                            "comp": {
                                "name": "FieldBox",
                                "orientation": "vertical",
                                "editorData": {
                                    "labelPosition": "none",
                                    "displayName": "Bottom section",
                                    "alignment": "left",
                                    "spacers": {
                                        "before": 0,
                                        "after": 3,
                                        "xax-before": 0,
                                        "xax-after": 3
                                    }
                                },
                                "items": [],
                                "pack": "start"
                            },
                            "layout": {
                                "box-flex-pack": "start",
                                "min-width": 0
                            }
                        },
                        {
                            "id": "bottomSpacer",
                            "comp": {
                                "name": "VSpacer",
                                "size": "0"
                            }
                        }
                    ]
                },
                "id": "def_0",
                "editorData": {
                    "wasChanged": true
                }
            };

            it('vertical fieldBox in HBox which contains a manual width field', function () {
                var appPart2MinWidth = appPart2LayoutUtils.getAppPart2MinWidth(itemDef1);

                expect(appPart2MinWidth).toEqual(520);
            });

            it('center section has no field with manual width, and a field with a manual width in the top section', function () {

                var appPart2MinWidth = appPart2LayoutUtils.getAppPart2MinWidth(itemDef2);

                expect(appPart2MinWidth).toEqual(720);
            });

            describe('updateAppPart2MinWidth', function () {
                it('component is not of type desktop, and hidden field was changed - should not update', function () {
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL();
                    var compRef = {id: 'aaa', type: 'MOBILE'};

                    spyOn(structure, 'updateCompLayout');
                    spyOn(component.layout, 'get');

                    appPart2LayoutUtils.updateAppPart2MinWidth(ps, compRef, {hidden: true}, itemDef1);

                    expect(component.layout.get).not.toHaveBeenCalled();
                    expect(structure.updateCompLayout).not.toHaveBeenCalled();
                });

                it('component is of type desktop, and non hidden field was changed - should not update', function () {
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL();
                    var compRef = {id: 'aaa', type: 'DESKTOP'};

                    spyOn(structure, 'updateCompLayout');
                    spyOn(component.layout, 'get');

                    appPart2LayoutUtils.updateAppPart2MinWidth(ps, compRef, {underline: true}, itemDef1);

                    expect(component.layout.get).not.toHaveBeenCalled();
                    expect(structure.updateCompLayout).not.toHaveBeenCalled();
                });

                _.forEach([true, false, "It doesn't really matter"], function (hidden) {
                    it('component is of type desktop, hidden field was changed, component width is larger than minWidth - should not update component width', function () {
                        var ps = privateServicesHelper.mockPrivateServicesWithRealDAL();
                        var compRef = {id: 'aaa', type: 'DESKTOP'};

                        spyOn(component.layout, 'get').and.returnValue({width: 530});
                        spyOn(structure, 'updateCompLayout');

                        appPart2LayoutUtils.updateAppPart2MinWidth(ps, compRef, {hidden: hidden}, itemDef1);

                        expect(component.layout.get).toHaveBeenCalledWith(ps, compRef);
                        expect(structure.updateCompLayout).not.toHaveBeenCalled();
                    });
                });

                _.forEach([true, false, "It doesn't really matter"], function (hidden) {
                    it('component is of type desktop, hidden field was changed, component width is smaller than minWidth - should update component width', function () {
                        var ps = privateServicesHelper.mockPrivateServicesWithRealDAL();
                        var compRef = {id: 'aaa', type: 'DESKTOP'};

                        spyOn(component.layout, 'get').and.returnValue({width: 510});
                        spyOn(structure, 'updateCompLayout');

                        appPart2LayoutUtils.updateAppPart2MinWidth(ps, compRef, {hidden: hidden}, itemDef1);

                        expect(component.layout.get).toHaveBeenCalledWith(ps, compRef);
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, compRef, {width: 520});
                    });
                });

            });
        });

        describe('getFieldBoxMinWidth', function () {


            describe('horizontal', function () {
                it('minWidth should be the sum of the each field plus its spacers, ignoring hidden fields', function () {
                    var minWidths = [100 + 3, 0 + 11, 150 + 11];
                    viewDef.comp.orientation = "horizontal";
                    var fieldMinWidth = appPart2LayoutUtils.getFieldBoxMinWidth("horizontal", viewDef.comp.items);
                    var sum = _.reduce(minWidths, function (acc, x) {
                        return acc + x;
                    }, 0);
                    expect(fieldMinWidth).toEqual(sum);
                });

            });

            describe('vertical', function () {
                it('minWidth should be the max of the each field plus its spacers, ignoring hidden fields', function () {
                    var minWidths = [100 + 7, 0 + 15, 150 + 15];
                    var fieldMinWidth = appPart2LayoutUtils.getFieldBoxMinWidth("vertical", viewDef.comp.items);
                    expect(fieldMinWidth).toEqual(_.max(minWidths));
                });

            });

        });

        describe('getFieldMinWidth', function () {
            it('fieldProxy should return its width', function () {
                var fieldMinWidth = appPart2LayoutUtils.getFieldMinWidth(field1);
                expect(fieldMinWidth).toEqual(100);
            });

            it('textFieldProxy with auto width should return 0', function () {
                var fieldMinWidth = appPart2LayoutUtils.getFieldMinWidth(autoWidthTextField1);
                expect(fieldMinWidth).toEqual(0);
            });

            it('textFieldProxy with manual width should its width', function () {
                var fieldMinWidth = appPart2LayoutUtils.getFieldMinWidth(fixedWidthTextField1);
                expect(fieldMinWidth).toEqual(150);
            });

        });

        describe('getSpacers', function () {

            describe('horizontal', function () {
                it('get the before and after spacers', function () {
                    var fieldMinWidth = appPart2LayoutUtils.getSpacers(field1, 'horizontal');
                    expect(fieldMinWidth).toEqual(3);
                });
            });

            describe('vertical', function () {
                it('get the xax spacers', function () {
                    var fieldMinWidth = appPart2LayoutUtils.getSpacers(field1, 'vertical');
                    expect(fieldMinWidth).toEqual(7);
                });
            });
        });

    });
});
