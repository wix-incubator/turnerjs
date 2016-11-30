define([
    'lodash',
    'documentServices/page/pageData'
], function(
    _,
    pageData
) {
    'use strict';

    function getCommonStructure() {
        return {
            componentType: 'mobile.core.components.Page',
            type: 'Page',
            id: 'mainPage',
            styleId: 'p2',
            skin: 'skins.core.InlineSkin',
            layout: {x: 0, y: 0, width: 980, height: 500, anchors: []},
            data: {
                type: 'Page',
                metaData: {isPreset: false, schemaVersion: '1.0', isHidden: false},
                title: 'Blank',
                hideTitle: true,
                icon: '',
                descriptionSEO: '',
                metaKeywordsSEO: '',
                pageTitleSEO: '',
                pageUriSEO: '',
                hidePage: false,
                underConstruction: false,
                pageBackgrounds: null
            },
            components: []
        };
    }

    function getBlankPageStructure(ps, pageId) {
        var pageStructure = getCommonStructure(ps);

        pageStructure.data = _.assign(pageStructure.data, {
            pageUriSEO: pageData.getValidPageUriSEO(ps, pageId, 'blank'),
            pageBackgrounds: pageData.getPageDataWithoutIds(ps, ps.siteAPI.getPrimaryPageId()).pageBackgrounds
        });

        return pageStructure;
    }

    function getBlankPopupPageStructure(ps) {
        var pageStructure = getCommonStructure(ps);

        pageStructure.data = _.assign({}, pageStructure.data, {
            "pageBackgrounds": {
                "desktop": {
                    "custom": true,
                    "ref": {
                        "type": "BackgroundMedia",
                        "color": "{color_11}",
                        "alignType": "top",
                        "fittingType": "fill",
                        "scrollType": "fixed"
                    },
                    "isPreset": false
                },
                "mobile": {
                    "custom": true,
                    "ref": {
                        "type": "BackgroundMedia",
                        "color": "{color_11}",
                        "alignType": "top",
                        "fittingType": "fill",
                        "scrollType": "fixed"
                    },
                    "isPreset": true
                }
            },
            "indexable": false,
            "isPopup": true
        });

        var props = {
            "popup": {
                "closeOnOverlayClick": true
            }
        };

        pageStructure.props = _.defaults({
            "type": "PageProperties",
            "metaData": {
                "schemaVersion": "1.0"
            },
            "mobile": _.cloneDeep(props),
            "desktop": _.cloneDeep(props)
        }, pageStructure.props);

        pageStructure.components = [
            {
                "type":"Container",
                "components":[],
                "skin": "wysiwyg.viewer.skins.stripContainer.DefaultStripContainer",
                "props": {
                    "type": "PopupContainerProperties",
                    "metaData": {
                        "schemaVersion": "1.0"
                    },
                    "horizontalAlignment": "center",
                    "verticalAlignment": "center",
                    "alignmentType": "nineGrid",
                    "horizontalOffset": 0,
                    "verticalOffset": 0
                },
                "design": {
                    "type": "MediaContainerDesignData",
                    "metaData": {
                        "isPreset": false,
                        "schemaVersion": "1.0",
                        "isHidden": false
                    },
                    "background": {
                        "type": "BackgroundMedia",
                        "metaData": {
                            "isPreset": false,
                            "schemaVersion": "1.0",
                            "isHidden": false
                        },
                        "color": "#FFFFFE",
                        "colorOpacity": 1,
                        "alignType": "center",
                        "fittingType": "fill",
                        "scrollType": "none",
                        "colorOverlay": "",
                        "colorOverlayOpacity": 0
                    }
                },
                "layout":{
                    "width":340,
                    "height":276,
                    "x":620,
                    "y":80,
                    "scale":1,
                    "rotationInDegrees":0,
                    "anchors":[]
                },
                "componentType": "wysiwyg.viewer.components.PopupContainer",
                "style": {
                    "type": "TopLevelStyle",
                    "metaData": {
                        "isPreset": false,
                        "schemaVersion": "1.0",
                        "isHidden": false
                    },
                    "style": {
                        "properties": {
                            "alpha-bg": "1",
                            "bg": "rgba(255,255,255,1)"
                        },
                        "propertiesSource": {
                            "alpha-bg": "value",
                            "bg": "value"
                        },
                        "groups": {}
                    },
                    "componentClassName": "wysiwyg.viewer.components.PopupContainer",
                    "pageId": "",
                    "compId": "",
                    "styleType": "custom",
                    "skin": "wysiwyg.viewer.skins.stripContainer.DefaultStripContainer",
                    "id": "style-ili7m0pe"
                }
            }
        ];

        return pageStructure;
    }


    return {
        getBlankPageStructure: getBlankPageStructure,
        getBlankPopupPageStructure: getBlankPopupPageStructure
    };
});
