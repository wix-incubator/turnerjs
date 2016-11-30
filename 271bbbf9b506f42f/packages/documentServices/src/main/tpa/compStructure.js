define(['lodash',
    'documentServices/tpa/constants',
    'documentServices/page/page',
    'documentServices/page/pageData'
], function (_, tpaConstants, page, pageData) {
    'use strict';

    var getSectionStructure = function (ps, definitionData, sectionId, tpaPageId, hidePage, indexable, isLandingPage, pageUriSEO) {
        var appId = definitionData.applicationId;
        //TODO - get this from definitionData
        var defSize = {
            w: 980,
            h: 500
        };

        return {
            "componentType":"mobile.core.components.Page",
            "type":"Page",
            "styleId": "p2",
            "skin":"skins.core.InlineSkin",
            "layout":{
                "x":0,
                "y":0,
                "width":defSize.w,
                "height":defSize.h,
                "anchors":[]
            },
            "data":{
                "type":"Page",
                "metaData": {
                    "isPreset": false,
                    "schemaVersion": "1.0",
                    "isHidden": false
                },
                "hideTitle":true,
                "icon": "",
                "descriptionSEO":"",
                "metaKeywordsSEO":"",
                "pageTitleSEO": "",
                "pageUriSEO": pageUriSEO,
                "hidePage": hidePage,
                "mobileHidePage": null,
                "underConstruction":false,
                "tpaApplicationId": appId,
                "indexable": _.isBoolean(indexable) ? indexable : true,
                "tpaPageId": tpaPageId,
                "pageBackgrounds": pageData.getPageDataWithoutIds(ps, ps.siteAPI.getPrimaryPageId()).pageBackgrounds,
                "isLandingPage": _.isBoolean(isLandingPage) ? isLandingPage : false
            },
            "components":[]
        };
    };

    var getSubSectionStructure = function (ps, definitionData, sectionId, pageUriSEO) {
        var structure = getSectionStructure(ps, definitionData, sectionId, definitionData.appPage.id, true, definitionData.appPage.indexable, definitionData.appPage.fullPage, pageUriSEO);
        structure.data.title = definitionData.appPage.name;
        return structure;
    };

    var getMultiSectionStructure = function (ps, definitionData, sectionId, pageUriSEO) {
        var tpaPageId = definitionData.appPage.id + '$TPA$' + sectionId;
        var structure = getSectionStructure(ps, definitionData, sectionId, tpaPageId, false, definitionData.appPage.indexable, definitionData.appPage.fullPage, pageUriSEO);
        return structure;
    };

    var getWidgetStructure = function(applicationId, widgetId, layout, styleId) {
        return {
            "layout": {
                "width": layout && layout.width,
                "height": layout && layout.height,
                "x": layout && layout.x,
                "y": layout && layout.y,
                "anchors": []
            },
            data: {
                widgetId: widgetId,
                applicationId: applicationId.toString(),
                type: tpaConstants.DATA_TYPE.TPA_WIDGET,
                metaData: {
                    isHidden: false,
                    isPreset: true,
                    schemaVersion: '1.0'
                }
            },
            "type": "Component",
            "skin": tpaConstants.SKINS.TPA_WIDGET,
            "componentType": tpaConstants.COMP_TYPES.TPA_WIDGET,
            "style": styleId || tpaConstants.STYLE.TPA_WIDGET
        };
    };

    var getGluedWidgetStructure = function(applicationId, widgetData, layout, styleId) {
        return {
            "layout": {
                "width": layout && layout.width || 300,
                "height": layout && layout.height || 200,
                "x": layout && layout.x || 300,
                "y": layout && layout.y || 120,
                "anchors": [],
                "fixedPosition": true
            },
            data: {
                widgetId: widgetData.widgetId,
                applicationId: applicationId.toString(),
                type: tpaConstants.DATA_TYPE.TPA_WIDGET,
                metaData: {
                    isHidden: false,
                    isPreset: true,
                    schemaVersion: "1.0"
                }
            },
            "type": "Component",
            "skin": tpaConstants.SKINS.TPA_WIDGET,
            "componentType": tpaConstants.COMP_TYPES.TPA_GLUED_WIDGET,
            "style": styleId || tpaConstants.STYLE.TPA_GLUED_WIDGET,
            "props":  {
                placement: widgetData.gluedOptions.placement,
                verticalMargin: widgetData.gluedOptions.verticalMargin,
                horizontalMargin: widgetData.gluedOptions.horizontalMargin,
                type: "TPAGluedProperties",
                metaData: {
                    schemaVersion: "1.0"
                }
            }
        };
    };
    return {
        getSectionStructure: getSectionStructure,
        getWidgetStructure: getWidgetStructure,
        getGluedWidgetStructure: getGluedWidgetStructure,
        /**
         * Structure for hidden sub sections
         */
        getSubSectionStructure: getSubSectionStructure,
        /**
         * Structure for multi main section
         */
        getMultiSectionStructure: getMultiSectionStructure
    };
});
