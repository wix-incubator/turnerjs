define([], function () {
    'use strict';
    return {
        default: {
            "type": {
                "version": 0,
                "baseTypes": [],
                "name": "NewsPosts_i6cku5qm357",
                "displayName": "Various Posts",
                "fields": [
                    {
                        "displayName": "Title",
                        "name": "title",
                        "defaultValue": "I'm a news headline",
                        "searchable": false,
                        "type": "String",
                        "computed": false
                    }
                ]
            },
            "views": [
                {
                    "name": "PaginatedListTemplate3", "forType": "Array", "vars": {
                    "itemSpacing": 10, "paginationColor": "color_15"
                },
                    "comp": {
                        "name": "VBox", "box-align": "center", "items": [
                            {
                                "comp": {
                                    "name": "HBox", "hidden": {
                                        "$expr": "not($userTags.enabled)"
                                    },
                                    "items": [
                                        {
                                            "data": "$userTags", "comp": {
                                            "name": "ComboBox",
                                            "cssClass": "comboBox",
                                            "skin": "wysiwyg.viewer.skins.input.ComboBoxInputSimpleSkin",
                                            "events": {
                                                "selectionChanged": "onTagChanged"
                                            }
                                        },
                                            "layout": {
                                                "width": 165, "vertical-align": "middle", "spacerBefore": "*"
                                            }
                                        }
                                    ]
                                },
                                "layout": {
                                    "width": "100%", "spacerBefore": "20px", "spacerAfter": "30px"
                                }
                            },
                            {
                                "id": "paginatedlist", "comp": {
                                "name": "PaginatedList", "hidden": {
                                    "$expr": "eq(Array.length(this), 0)"
                                },
                                "hidePagination": "true", "itemsPerPage": "10", "templates": {
                                    "item": {
                                        "data": "$positionInParent", "comp": {
                                            "name": "SwitchBox", "cases": {
                                                "default": [
                                                    {
                                                        "id": "listItem", "comp": {
                                                        "name": "LIST_ITEM"
                                                    }
                                                    },
                                                    {
                                                        "id": "footerSpacer", "comp": {
                                                        "name": "VSpacer", "size": {
                                                            "$expr": "$itemSpacing"
                                                        }
                                                    }
                                                    },
                                                    {
                                                        "id": "gutterLine", "comp": {
                                                        "name": "HorizontalLine"
                                                    },
                                                        "layout": {
                                                            "spacerAfter": {
                                                                "$expr": "$itemSpacing"
                                                            }
                                                        }
                                                    }
                                                ],
                                                "last": [
                                                    {
                                                        "id": "listItem", "comp": {
                                                        "name": "LIST_ITEM"
                                                    }
                                                    },
                                                    {
                                                        "comp": {
                                                            "name": "VBox", "hidden": "true", "items": [
                                                                {
                                                                    "id": "footerSpacer", "comp": {
                                                                    "name": "VSpacer", "size": {
                                                                        "$expr": "$itemSpacing"
                                                                    }
                                                                }
                                                                },
                                                                {
                                                                    "id": "gutterLine", "comp": {
                                                                    "name": "HorizontalLine"
                                                                },
                                                                    "layout": {
                                                                        "spacerAfter": {
                                                                            "$expr": "$itemSpacing"
                                                                        }
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        "comp": {
                                                            "name": "VSpacer", "size": "9"
                                                        }
                                                    },
                                                    {
                                                        "id": "paginationNavigationBox", "comp": {
                                                        "name": "HBox", "hidden": {
                                                            "$expr": "$hidePagination"
                                                        },
                                                        "box-align": "center", "items": [
                                                            {
                                                                "comp": {
                                                                    "name": "HSpacer", "size": "*"
                                                                }
                                                            },
                                                            {
                                                                "value": "◄", "comp": {
                                                                "name": "Label",
                                                                "cssClass": "paginationPrev",
                                                                "events": {
                                                                    "dom:click": "prevPageClicked"
                                                                }
                                                            },
                                                                "layout": {
                                                                    "spacerAfter": 4
                                                                }
                                                            },
                                                            {
                                                                "value": {
                                                                    "$expr": "String.concat($currentPage,'/',$maxPage)"
                                                                },
                                                                "comp": {
                                                                    "name": "Label"
                                                                },
                                                                "layout": {
                                                                    "spacerAfter": 4
                                                                }
                                                            },
                                                            {
                                                                "value": "►", "comp": {
                                                                "name": "Label",
                                                                "cssClass": "paginationNext",
                                                                "events": {
                                                                    "dom:click": "nextPageClicked"
                                                                }
                                                            }
                                                            },
                                                            {
                                                                "comp": {
                                                                    "name": "HSpacer", "size": "*"
                                                                }
                                                            }
                                                        ]
                                                    },
                                                        "layout": {
                                                            "position": "relative"
                                                        }
                                                    }
                                                ]
                                            },
                                            "css": {
                                                "min-width": "100%"
                                            }
                                        }
                                    }
                                }
                            },
                                "layout": {
                                    "width": "100%"
                                }
                            },
                            {
                                "id": "noItemsLabel",
                                "value": "@LIST_SETTINGS_PANEL_NoItemsMessagePlaceholder@",
                                "comp": {
                                    "name": "Label", "hidden": {
                                        "$expr": "gt(String.length(this), 0)"
                                    }
                                }
                            }
                        ],
                        "editorData": {
                            "isPaginated": true, "hasTags": true
                        }
                    },
                    "stylesheet": [
                        {
                            ".paginationPrev, .paginationNext": {
                                "padding": "0 5px",
                                "display": "inline-block",
                                "font-size": "14px",
                                "cursor": "pointer",
                                "color": {
                                    "$expr": "Theme.getColor($paginationColor)"
                                },
                                "-webkit-touch-callout": "none",
                                "-webkit-user-select": "none",
                                "-khtml-user-select": "none",
                                "-moz-user-select": "none",
                                "-ms-user-select": "none",
                                "user-select": "none"
                            }
                        },
                        {
                            ".comboBox select": {
                                "font-size": "14px"
                            }
                        }
                    ],
                    "customizations": [
                        {
                            "priority": 105, "fieldId": "paginatedlist", "key": "comp.hidePagination", "input": {
                            "name": "checkbox",
                            "falseVal": "true",
                            "label": "@LIST_SETTINGS_PANEL_UsePagination@",
                            "defaultVal": "true",
                            "trueVal": "false",
                            "spaceAfter": "10"
                        }
                        },
                        {
                            "priority": 105, "fieldId": "paginatedlist", "key": "comp.itemsPerPage", "input": {
                            "name": "slider",
                            "maxVal": "120",
                            "minVal": "1",
                            "label": "@LIST_SETTINGS_PANEL_ItemsPerPage@",
                            "spaceAfter": "20",
                            "hiddenwhen": {
                                "fieldId": "paginatedlist", "key": "comp.hidePagination", "value": "true"
                            }
                        }
                        },
                        {
                            "priority": 100, "fieldId": "vars", "key": "itemSpacing", "input": {
                            "name": "slider",
                            "maxVal": "300",
                            "minVal": "0",
                            "label": "@LIST_SETTINGS_PANEL_ItemSpacing@",
                            "spaceAfter": "20"
                        }
                        },
                        {
                            "priority": 95, "fieldId": "gutterLine", "key": "comp.hidden", "input": {
                            "name": "checkbox",
                            "falseVal": "true",
                            "label": "@LIST_SETTINGS_PANEL_ShowDivider@",
                            "defaultVal": "false",
                            "trueVal": "false"
                        }
                        },
                        {
                            "priority": 90, "fieldId": "gutterLine", "key": "comp.style", "input": {
                            "name": "changestyle",
                            "showAs": "link",
                            "label": "@LIST_SETTINGS_PANEL_ChangeStyle@",
                            "spaceAfter": "20"
                        }
                        }
                    ]
                },
                {
                    "name": "BlankList", "forType": "BlankType", "comp": {
                    "name": "VBox", "items": [
                        {
                            "id": "Top", "comp": {
                            "name": "FieldBox", "orientation": "horizontal", "editorData": {
                                "labelPosition": "none", "alignment": "left"
                            }
                        }
                        },
                        {
                            "id": "topSpacer", "comp": {
                            "name": "VSpacer", "size": "0"
                        }
                        },
                        {
                            "comp": {
                                "name": "HBox", "items": [
                                    {
                                        "id": "Left", "comp": {
                                        "name": "FieldBox", "orientation": "vertical", "editorData": {
                                            "labelPosition": "none", "alignment": "left", "spacers": {
                                                "before": 3, "after": 0, "xax-before": 0, "xax-after": 0
                                            }
                                        }
                                    },
                                        "layout": {
                                            "spacerAfter": 0
                                        }
                                    },
                                    {
                                        "id": "leftToCenterSpacer", "comp": {
                                        "name": "HSpacer", "size": "0"
                                    }
                                    },
                                    {
                                        "id": "Center", "comp": {
                                        "name": "FieldBox", "orientation": "vertical", "pack": "center", "items": [
                                            {
                                                "id": "text_1", "data": "title", "comp": {
                                                "name": "TextField",
                                                "box-align": "center",
                                                "width": "200",
                                                "width-mode": "auto",
                                                "items": [
                                                    {
                                                        "id": "text_1_proxy", "data": "title", "comp": {
                                                        "name": "Label", "style": "Body L", "bold": "true"
                                                    },
                                                        "layout": {
                                                            "text-align": "center"
                                                        }
                                                    }
                                                ],
                                                "spacers": {
                                                    "before": 0, "after": 10
                                                }
                                            }
                                            }
                                        ],
                                        "editorData": {
                                            "labelPosition": "none", "alignment": "left"
                                        }
                                    },
                                        "layout": {
                                            "box-flex": 1
                                        }
                                    },
                                    {
                                        "id": "centerToRightSpacer", "comp": {
                                        "name": "HSpacer", "size": "0"
                                    }
                                    },
                                    {
                                        "id": "Right", "comp": {
                                        "name": "FieldBox", "orientation": "vertical", "pack": "center", "editorData": {
                                            "labelPosition": "none", "alignment": "left", "spacers": {
                                                "before": 0, "after": 0, "xax-before": 10, "xax-after": 0
                                            }
                                        }
                                    }
                                    }
                                ]
                            }
                        },
                        {
                            "id": "Bottom", "comp": {
                            "name": "FieldBox", "orientation": "vertical", "editorData": {
                                "labelPosition": "none", "alignment": "left"
                            }
                        },
                            "layout": {
                                "box-flex-pack": "start"
                            }
                        },
                        {
                            "id": "bottomSpacer", "comp": {
                            "name": "VSpacer", "size": "0"
                        }
                        }
                    ]
                }
                }
            ]
        },
        "2.0": {
            "type": {
                "version": 0,
                "baseTypes": [],
                "name": "NewsPosts_i6cku5qm357",
                "displayName": "Various Posts",
                "fields": [
                    {
                        "displayName": "Title",
                        "name": "title",
                        "defaultValue": "I'm a news headline",
                        "searchable": false,
                        "type": "String",
                        "computed": false
                    },
                    {
                        "type": "wix:Image",
                        "displayName": "Image",
                        "searchable": false,
                        "name": "image",
                        "defaultValue": {
                            "width": 600,
                            "src": "images/items/bloom.jpg",
                            "height": 600,
                            "_type": "wix:Image",
                            "title": "Default image"
                        },
                        "computed": false
                    },
                    {
                        "name": "Strng_sTxt1",
                        "searchable": false,
                        "displayName": "Subtitle",
                        "type": "String",
                        "computed": false,
                        "defaultValue": "Add Date here"
                    },
                    {
                        "displayName": "Description",
                        "type": "wix:RichText",
                        "searchable": false,
                        "defaultValue": {
                            "version": 1,
                            "_type": "wix:RichText",
                            "text": "Add News Story here",
                            "links": []
                        },
                        "name": "wxRchTxt_sTxt0",
                        "computed": false
                    },
                    {
                        "name": "links",
                        "type": "wix:Map",
                        "searchable": false,
                        "displayName": "",
                        "defaultValue": {
                            "_type": "wix:Map"
                        },
                        "computed": false
                    },
                    {
                        "name": "Strng_sBttn0-v1c",
                        "defaultValue": "Read More",
                        "searchable": false,
                        "metadata": {
                            "showAsHint": "AsButton"
                        },
                        "type": "String",
                        "displayName": "Button",
                        "computed": false
                    },
                    {
                        "defaultValue": {
                            "_type": "wix:Video",
                            "videoId": "83nu4yXFcYU",
                            "videoType": "YOUTUBE"
                        },
                        "name": "i6ckxtsf",
                        "type": "wix:Video",
                        "searchable": false,
                        "displayName": "Video",
                        "computed": false
                    }
                ]
            },
            "views": [
                {
                    "name": "TemplateViewVersion_2.0",
                    "forType": "Array",
                    "vars": {
                        "itemSpacing": 60,
                        "paginationColor": "color_15"
                    },
                    "comp": {
                        "name": "VBox",
                        "items": [
                            {
                                "id": "paginatedlist",
                                "comp": {
                                    "name": "PaginatedList",
                                    "hidden": {
                                        "$expr": "eq(Array.length(this), 0)"
                                    },
                                    "hidePagination": "true",
                                    "itemsPerPage": "10",
                                    "templates": {
                                        "item": {
                                            "data": "$positionInParent",
                                            "comp": {
                                                "name": "SwitchBox",
                                                "cases": {
                                                    "default": [
                                                        {
                                                            "id": "listItem",
                                                            "comp": {
                                                                "name": "TemplateViewVersion_2.0"
                                                            }
                                                        },
                                                        {
                                                            "id": "footerSpacer",
                                                            "comp": {
                                                                "name": "VSpacer",
                                                                "size": {
                                                                    "$expr": "$itemSpacing"
                                                                }
                                                            }
                                                        },
                                                        {
                                                            "id": "gutterLine",
                                                            "comp": {
                                                                "name": "HorizontalLine",
                                                                "hidden": "true"
                                                            },
                                                            "layout": {
                                                                "spacerAfter": {
                                                                    "$expr": "$itemSpacing"
                                                                }
                                                            }
                                                        }
                                                    ],
                                                    "last": [
                                                        {
                                                            "id": "listItem",
                                                            "comp": {
                                                                "name": "TemplateViewVersion_2.0"
                                                            }
                                                        },
                                                        {
                                                            "comp": {
                                                                "name": "VBox",
                                                                "hidden": "true",
                                                                "items": [
                                                                    {
                                                                        "id": "footerSpacer",
                                                                        "comp": {
                                                                            "name": "VSpacer",
                                                                            "size": {
                                                                                "$expr": "$itemSpacing"
                                                                            }
                                                                        }
                                                                    },
                                                                    {
                                                                        "id": "gutterLine",
                                                                        "comp": {
                                                                            "name": "HorizontalLine",
                                                                            "hidden": "true"
                                                                        },
                                                                        "layout": {
                                                                            "spacerAfter": {
                                                                                "$expr": "$itemSpacing"
                                                                            }
                                                                        }
                                                                    }
                                                                ]
                                                            },
                                                            "id": "def_7"
                                                        },
                                                        {
                                                            "comp": {
                                                                "name": "VSpacer",
                                                                "size": "9"
                                                            },
                                                            "id": "def_10"
                                                        },
                                                        {
                                                            "id": "paginationNavigationBox",
                                                            "comp": {
                                                                "name": "HBox",
                                                                "hidden": {
                                                                    "$expr": "$hidePagination"
                                                                },
                                                                "box-align": "center",
                                                                "items": [
                                                                    {
                                                                        "comp": {
                                                                            "name": "HSpacer",
                                                                            "size": "*"
                                                                        },
                                                                        "id": "def_12"
                                                                    },
                                                                    {
                                                                        "value": "◄",
                                                                        "comp": {
                                                                            "name": "Label",
                                                                            "cssClass": "paginationPrev",
                                                                            "events": {
                                                                                "dom:click": "prevPageClicked"
                                                                            }
                                                                        },
                                                                        "layout": {
                                                                            "spacerAfter": 4
                                                                        },
                                                                        "id": "def_13"
                                                                    },
                                                                    {
                                                                        "value": {
                                                                            "$expr": "String.concat($currentPage,'/',$maxPage)"
                                                                        },
                                                                        "comp": {
                                                                            "name": "Label"
                                                                        },
                                                                        "layout": {
                                                                            "spacerAfter": 4
                                                                        },
                                                                        "id": "def_14"
                                                                    },
                                                                    {
                                                                        "value": "►",
                                                                        "comp": {
                                                                            "name": "Label",
                                                                            "cssClass": "paginationNext",
                                                                            "events": {
                                                                                "dom:click": "nextPageClicked"
                                                                            }
                                                                        },
                                                                        "id": "def_15"
                                                                    },
                                                                    {
                                                                        "comp": {
                                                                            "name": "HSpacer",
                                                                            "size": "*"
                                                                        },
                                                                        "id": "def_16"
                                                                    }
                                                                ]
                                                            },
                                                            "layout": {
                                                                "position": "relative"
                                                            }
                                                        }
                                                    ]
                                                },
                                                "css": {
                                                    "min-width": "100%"
                                                }
                                            },
                                            "id": "$positionInParent"
                                        }
                                    }
                                }
                            },
                            {
                                "id": "noItemsLabel",
                                "value": "There are no items in this list",
                                "comp": {
                                    "name": "Label",
                                    "hidden": {
                                        "$expr": "gt(String.length(this), 0)"
                                    }
                                }
                            }
                        ],
                        "editorData": {
                            "isPaginated": true
                        }
                    },
                    "stylesheet": [
                        {
                            ".paginationPrev, .paginationNext": {
                                "padding": "0 5px",
                                "display": "inline-block",
                                "font-size": "14px",
                                "cursor": "pointer",
                                "-webkit-touch-callout": "none",
                                "-webkit-user-select": "none",
                                "-khtml-user-select": "none",
                                "-moz-user-select": "none",
                                "-ms-user-select": "none",
                                "user-select": "none"
                            }
                        }
                    ],
                    "customizations": [
                        {
                            "priority": 105,
                            "fieldId": "paginatedlist",
                            "key": "comp.hidePagination",
                            "input": {
                                "name": "checkbox",
                                "falseVal": "true",
                                "label": "Split your list across multiple pages",
                                "defaultVal": "true",
                                "trueVal": "false",
                                "spaceAfter": "10"
                            }
                        },
                        {
                            "priority": 105,
                            "fieldId": "paginatedlist",
                            "key": "comp.itemsPerPage",
                            "input": {
                                "name": "slider",
                                "maxVal": "120",
                                "minVal": "1",
                                "label": "Items Per Page",
                                "spaceAfter": "20",
                                "hiddenwhen": {
                                    "fieldId": "paginatedlist",
                                    "key": "comp.hidePagination",
                                    "value": "true"
                                }
                            }
                        },
                        {
                            "priority": 100,
                            "fieldId": "vars",
                            "key": "itemSpacing",
                            "input": {
                                "name": "slider",
                                "maxVal": "300",
                                "minVal": "0",
                                "label": "Item Spacing",
                                "spaceAfter": "20"
                            }
                        },
                        {
                            "priority": 95,
                            "fieldId": "gutterLine",
                            "key": "comp.hidden",
                            "input": {
                                "name": "checkbox",
                                "falseVal": "true",
                                "label": "Show item separator",
                                "defaultVal": "false",
                                "trueVal": "false"
                            }
                        },
                        {
                            "priority": 90,
                            "fieldId": "gutterLine",
                            "key": "comp.style",
                            "input": {
                                "name": "changestyle",
                                "showAs": "link",
                                "label": "Change Item Separator Style",
                                "spaceAfter": "20"
                            }
                        }
                    ],
                    "id": "i7ek4nzf"
                },
                {
                    "name": "TemplateViewVersion_2.0",
                    "forType": "Array",
                    "vars": {
                        "itemSpacing": 60,
                        "paginationColor": "color_15"
                    },
                    "comp": {
                        "name": "VBox",
                        "items": [
                            {
                                "id": "paginatedlist",
                                "comp": {
                                    "name": "PaginatedList",
                                    "hidden": {
                                        "$expr": "eq(Array.length(this), 0)"
                                    },
                                    "hidePagination": "true",
                                    "itemsPerPage": "10",
                                    "templates": {
                                        "item": {
                                            "data": "$positionInParent",
                                            "comp": {
                                                "name": "SwitchBox",
                                                "cases": {
                                                    "default": [
                                                        {
                                                            "id": "listItem",
                                                            "comp": {
                                                                "name": "TemplateViewVersion_2.0"
                                                            }
                                                        },
                                                        {
                                                            "id": "footerSpacer",
                                                            "comp": {
                                                                "name": "VSpacer",
                                                                "size": {
                                                                    "$expr": "$itemSpacing"
                                                                }
                                                            }
                                                        },
                                                        {
                                                            "id": "gutterLine",
                                                            "comp": {
                                                                "name": "HorizontalLine",
                                                                "hidden": "true"
                                                            },
                                                            "layout": {
                                                                "spacerAfter": {
                                                                    "$expr": "$itemSpacing"
                                                                }
                                                            }
                                                        }
                                                    ],
                                                    "last": [
                                                        {
                                                            "id": "listItem",
                                                            "comp": {
                                                                "name": "TemplateViewVersion_2.0"
                                                            }
                                                        },
                                                        {
                                                            "comp": {
                                                                "name": "VBox",
                                                                "hidden": "true",
                                                                "items": [
                                                                    {
                                                                        "id": "footerSpacer",
                                                                        "comp": {
                                                                            "name": "VSpacer",
                                                                            "size": {
                                                                                "$expr": "$itemSpacing"
                                                                            }
                                                                        }
                                                                    },
                                                                    {
                                                                        "id": "gutterLine",
                                                                        "comp": {
                                                                            "name": "HorizontalLine",
                                                                            "hidden": "true"
                                                                        },
                                                                        "layout": {
                                                                            "spacerAfter": {
                                                                                "$expr": "$itemSpacing"
                                                                            }
                                                                        }
                                                                    }
                                                                ]
                                                            },
                                                            "id": "def_7"
                                                        },
                                                        {
                                                            "comp": {
                                                                "name": "VSpacer",
                                                                "size": "9"
                                                            },
                                                            "id": "def_10"
                                                        },
                                                        {
                                                            "id": "paginationNavigationBox",
                                                            "comp": {
                                                                "name": "HBox",
                                                                "hidden": {
                                                                    "$expr": "$hidePagination"
                                                                },
                                                                "box-align": "center",
                                                                "items": [
                                                                    {
                                                                        "comp": {
                                                                            "name": "HSpacer",
                                                                            "size": "*"
                                                                        },
                                                                        "id": "def_12"
                                                                    },
                                                                    {
                                                                        "value": "◄",
                                                                        "comp": {
                                                                            "name": "Label",
                                                                            "cssClass": "paginationPrev",
                                                                            "events": {
                                                                                "dom:click": "prevPageClicked"
                                                                            }
                                                                        },
                                                                        "layout": {
                                                                            "spacerAfter": 4
                                                                        },
                                                                        "id": "def_13"
                                                                    },
                                                                    {
                                                                        "value": {
                                                                            "$expr": "String.concat($currentPage,'/',$maxPage)"
                                                                        },
                                                                        "comp": {
                                                                            "name": "Label"
                                                                        },
                                                                        "layout": {
                                                                            "spacerAfter": 4
                                                                        },
                                                                        "id": "def_14"
                                                                    },
                                                                    {
                                                                        "value": "►",
                                                                        "comp": {
                                                                            "name": "Label",
                                                                            "cssClass": "paginationNext",
                                                                            "events": {
                                                                                "dom:click": "nextPageClicked"
                                                                            }
                                                                        },
                                                                        "id": "def_15"
                                                                    },
                                                                    {
                                                                        "comp": {
                                                                            "name": "HSpacer",
                                                                            "size": "*"
                                                                        },
                                                                        "id": "def_16"
                                                                    }
                                                                ]
                                                            },
                                                            "layout": {
                                                                "position": "relative"
                                                            }
                                                        }
                                                    ]
                                                },
                                                "css": {
                                                    "min-width": "100%"
                                                }
                                            },
                                            "id": "$positionInParent"
                                        }
                                    }
                                }
                            },
                            {
                                "id": "noItemsLabel",
                                "value": "There are no items in this list",
                                "comp": {
                                    "name": "Label",
                                    "hidden": {
                                        "$expr": "gt(String.length(this), 0)"
                                    }
                                }
                            }
                        ],
                        "editorData": {
                            "isPaginated": true
                        }
                    },
                    "stylesheet": [
                        {
                            ".paginationPrev, .paginationNext": {
                                "padding": "0 5px",
                                "display": "inline-block",
                                "font-size": "14px",
                                "cursor": "pointer",
                                "-webkit-touch-callout": "none",
                                "-webkit-user-select": "none",
                                "-khtml-user-select": "none",
                                "-moz-user-select": "none",
                                "-ms-user-select": "none",
                                "user-select": "none"
                            }
                        }
                    ],
                    "customizations": [
                        {
                            "priority": 105,
                            "fieldId": "paginatedlist",
                            "key": "comp.hidePagination",
                            "input": {
                                "name": "checkbox",
                                "falseVal": "true",
                                "label": "Split your list across multiple pages",
                                "defaultVal": "true",
                                "trueVal": "false",
                                "spaceAfter": "10"
                            }
                        },
                        {
                            "priority": 105,
                            "fieldId": "paginatedlist",
                            "key": "comp.itemsPerPage",
                            "input": {
                                "name": "slider",
                                "maxVal": "120",
                                "minVal": "1",
                                "label": "Items Per Page",
                                "spaceAfter": "20",
                                "hiddenwhen": {
                                    "fieldId": "paginatedlist",
                                    "key": "comp.hidePagination",
                                    "value": "true"
                                }
                            }
                        },
                        {
                            "priority": 100,
                            "fieldId": "vars",
                            "key": "itemSpacing",
                            "input": {
                                "name": "slider",
                                "maxVal": "300",
                                "minVal": "0",
                                "label": "Item Spacing",
                                "spaceAfter": "20"
                            }
                        },
                        {
                            "priority": 95,
                            "fieldId": "gutterLine",
                            "key": "comp.hidden",
                            "input": {
                                "name": "checkbox",
                                "falseVal": "true",
                                "label": "Show item separator",
                                "defaultVal": "false",
                                "trueVal": "false"
                            }
                        },
                        {
                            "priority": 90,
                            "fieldId": "gutterLine",
                            "key": "comp.style",
                            "input": {
                                "name": "changestyle",
                                "showAs": "link",
                                "label": "Change Item Separator Style",
                                "spaceAfter": "20"
                            }
                        }
                    ],
                    "id": "i7ek4nzf",
                    "format": "Mobile"
                },
                {
                    "name": "TemplateViewVersion_2.0",
                    "forType": "NewsPosts_i6cku5qm357",
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
                                                            "name": "TextField",
                                                            "box-align": "start",
                                                            "width": "200",
                                                            "width-mode": "auto",
                                                            "min-lines": 0,
                                                            "max-lines": 0,
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
                                                            "spacers": {
                                                                "before": 0,
                                                                "after": 0,
                                                                "xax-before": 0
                                                            },
                                                            "height-mode": "auto"
                                                        }
                                                    },
                                                    {
                                                        "id": "fld_hfnxgxqo",
                                                        "data": "Strng_sTxt1",
                                                        "comp": {
                                                            "name": "TextField",
                                                            "width": "200",
                                                            "width-mode": "auto",
                                                            "min-lines": "0",
                                                            "max-lines": "0",
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
                                                            "spacers": {
                                                                "before": 0,
                                                                "after": 0,
                                                                "xax-before": 0,
                                                                "xax-after": 0
                                                            },
                                                            "labelPosition": "none",
                                                            "hidden": false
                                                        }
                                                    },
                                                    {
                                                        "id": "fld_hfxs75de",
                                                        "data": "wxRchTxt_sTxt0",
                                                        "comp": {
                                                            "name": "TextField",
                                                            "width": "200",
                                                            "width-mode": "auto",
                                                            "min-lines": "0",
                                                            "max-lines": "0",
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
                                                            "spacers": {
                                                                "before": 10,
                                                                "after": 0,
                                                                "xax-before": 0,
                                                                "xax-after": 0
                                                            },
                                                            "hidden": false,
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
                                                            "hidden": true,
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
                },
                {
                    "name": "TemplateViewVersion_2.0",
                    "forType": "NewsPosts_i6cku5qm357",
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
                                            "xax-after": 0
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
                                    "size": 0
                                }
                            },
                            {
                                "comp": {
                                    "name": "VBox",
                                    "items": [
                                        {
                                            "id": "def_3_0",
                                            "comp": {
                                                "name": "HBox",
                                                "orientation": "horizontal",
                                                "editorData": {
                                                    "labelPosition": "none",
                                                    "displayName": "def_3_0",
                                                    "alignment": "left",
                                                    "spacers": {
                                                        "before": 0,
                                                        "after": 3,
                                                        "xax-before": 3,
                                                        "xax-after": 0
                                                    }
                                                },
                                                "items": [
                                                    {
                                                        "id": "Left",
                                                        "comp": {
                                                            "name": "VBox",
                                                            "orientation": "vertical",
                                                            "items": [
                                                                {
                                                                    "id": "Left_0",
                                                                    "comp": {
                                                                        "name": "FieldBox",
                                                                        "items": [
                                                                            {
                                                                                "id": "fld_i70imvqs465",
                                                                                "data": "i6ckxtsf",
                                                                                "comp": {
                                                                                    "name": "Field",
                                                                                    "width": 280,
                                                                                    "height": 220,
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
                                                                                        "after": 0,
                                                                                        "xax-before": 0,
                                                                                        "xax-after": 10
                                                                                    },
                                                                                    "box-align": "left"
                                                                                }
                                                                            }
                                                                        ],
                                                                        "orientation": "horizontal",
                                                                        "editorData": {
                                                                            "labelPosition": "none",
                                                                            "displayName": "Left_0",
                                                                            "alignment": "left",
                                                                            "spacers": {
                                                                                "before": 0,
                                                                                "after": 3,
                                                                                "xax-before": 3,
                                                                                "xax-after": 0
                                                                            }
                                                                        }
                                                                    },
                                                                    "layout": {
                                                                        "min-width": 0
                                                                    }
                                                                },
                                                                {
                                                                    "id": "Left_1",
                                                                    "comp": {
                                                                        "name": "FieldBox",
                                                                        "orientation": "horizontal",
                                                                        "editorData": {
                                                                            "labelPosition": "none",
                                                                            "displayName": "Left_1",
                                                                            "alignment": "left",
                                                                            "spacers": {
                                                                                "before": 0,
                                                                                "after": 3,
                                                                                "xax-before": 3,
                                                                                "xax-after": 0
                                                                            }
                                                                        },
                                                                        "items": [
                                                                            {
                                                                                "id": "fld_i6m58mzj129",
                                                                                "data": "image",
                                                                                "comp": {
                                                                                    "name": "Field",
                                                                                    "width": 280,
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
                                                                                        "after": 0,
                                                                                        "xax-before": 0,
                                                                                        "xax-after": 10
                                                                                    },
                                                                                    "box-align": "left"
                                                                                }
                                                                            }
                                                                        ]
                                                                    },
                                                                    "layout": {
                                                                        "min-width": 0
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
                                                                    "xax-after": 0
                                                                }
                                                            },
                                                            "pack": "start"
                                                        },
                                                        "layout": {
                                                            "spacerAfter": 0,
                                                            "min-width": 0
                                                        }
                                                    }
                                                ]
                                            },
                                            "layout": {
                                                "min-width": 0
                                            }
                                        },
                                        {
                                            "id": "def_3_1",
                                            "comp": {
                                                "name": "HBox",
                                                "orientation": "horizontal",
                                                "editorData": {
                                                    "labelPosition": "none",
                                                    "displayName": "def_3_1",
                                                    "alignment": "left",
                                                    "spacers": {
                                                        "before": 0,
                                                        "after": 3,
                                                        "xax-before": 3,
                                                        "xax-after": 0
                                                    }
                                                },
                                                "items": [
                                                    {
                                                        "id": "leftToCenterSpacer",
                                                        "comp": {
                                                            "name": "HSpacer",
                                                            "size": 0
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
                                                                        "name": "TextField",
                                                                        "box-align": "start",
                                                                        "width": 86,
                                                                        "width-mode": "auto",
                                                                        "min-lines": 0,
                                                                        "max-lines": 0,
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
                                                                        "spacers": {
                                                                            "before": 0,
                                                                            "after": 0,
                                                                            "xax-before": 0
                                                                        },
                                                                        "height-mode": "auto"
                                                                    }
                                                                },
                                                                {
                                                                    "id": "fld_hfnxgxqo",
                                                                    "data": "Strng_sTxt1",
                                                                    "comp": {
                                                                        "name": "TextField",
                                                                        "width": 86,
                                                                        "width-mode": "auto",
                                                                        "min-lines": "0",
                                                                        "max-lines": "0",
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
                                                                        "spacers": {
                                                                            "before": 0,
                                                                            "after": 0,
                                                                            "xax-before": 0,
                                                                            "xax-after": 0
                                                                        },
                                                                        "labelPosition": "none",
                                                                        "hidden": false
                                                                    }
                                                                },
                                                                {
                                                                    "id": "fld_hfxs75de",
                                                                    "data": "wxRchTxt_sTxt0",
                                                                    "comp": {
                                                                        "name": "TextField",
                                                                        "width": 86,
                                                                        "width-mode": "auto",
                                                                        "min-lines": "0",
                                                                        "max-lines": "0",
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
                                                                        "spacers": {
                                                                            "before": 10,
                                                                            "after": 0,
                                                                            "xax-before": 0,
                                                                            "xax-after": 0
                                                                        },
                                                                        "hidden": false,
                                                                        "labelPosition": "none"
                                                                    }
                                                                },
                                                                {
                                                                    "id": "fld_i70if2w4348",
                                                                    "data": "Strng_sBttn0-v1c",
                                                                    "comp": {
                                                                        "name": "Field",
                                                                        "width": 280,
                                                                        "height": 44,
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
                                                                        "hidden": true,
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
                                                    }
                                                ]
                                            },
                                            "layout": {
                                                "min-width": 0
                                            }
                                        },
                                        {
                                            "id": "def_3_2",
                                            "comp": {
                                                "name": "HBox",
                                                "orientation": "horizontal",
                                                "editorData": {
                                                    "labelPosition": "none",
                                                    "displayName": "def_3_2",
                                                    "alignment": "left",
                                                    "spacers": {
                                                        "before": 0,
                                                        "after": 3,
                                                        "xax-before": 3,
                                                        "xax-after": 0
                                                    }
                                                },
                                                "items": [
                                                    {
                                                        "id": "centerToRightSpacer",
                                                        "comp": {
                                                            "name": "HSpacer",
                                                            "size": 3
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
                                                                    "xax-before": 0,
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
                                            "layout": {
                                                "min-width": 0
                                            }
                                        }
                                    ],
                                    "orientation": "vertical"
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
                                            "xax-after": 0
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
                                    "size": 0
                                }
                            }
                        ]
                    },
                    "id": "def_0",
                    "editorData": {
                        "wasChanged": true,
                        "originalWidth": 601
                    },
                    "format": "Mobile"
                }
            ],
            "displayName": "News Posts (wide)"
        }
    };
});
