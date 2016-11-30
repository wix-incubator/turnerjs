define(['lodash', 'experiment'], function (_, experiment) {
    'use strict';

    var shouldMigrateTextStyle = experiment.isOpen('migrateTextStyle');

    function replaceLltWithLlf(res, value, key) {
        res[key.replace('llt_', 'llf_')] = value;
        return res;
    }

    var SUBSCRIBE_FORM_LINE_LAYOUT_STYLE_FIXER = function (styleData) {
        styleData.style.properties = _.reduce(styleData.style.properties, replaceLltWithLlf, {});
        styleData.style.propertiesSource = _.reduce(styleData.style.propertiesSource, replaceLltWithLlf, {});
    };

    var CORRUPT_STYLES_FIXER = {
        "*": function (styleData) {
            if (styleData.id === 'THEME_DATA') {
                return;
            }
            if (!styleData.style) {
                styleData.style = {
                    properties: {},
                    propertiesSource: {},
                    groups: {}
                };
            }
        },
        "wysiwyg.common.components.subscribeform.viewer.skins.SubscribeFormLineLayoutFlat": SUBSCRIBE_FORM_LINE_LAYOUT_STYLE_FIXER,
        "wysiwyg.common.components.subscribeform.viewer.skins.SubscribeFormLineLayoutTransparentWithIcon": SUBSCRIBE_FORM_LINE_LAYOUT_STYLE_FIXER
    };

    function fixStyleParamsIfNeeded(style) {
        if (style.style) {
            _.forEach(style.style.properties, function (paramValue, paramName, properties) {
                if (typeof paramValue === 'string') {
                    properties[paramName] = paramValue.replace(/(\d)x/g, '$1px');
                }
            });
        }
    }

    function createDefaultWixAppsVideoStyle() {
        var newStyle = {
            "type": "TopLevelStyle",
            "id": "v2",
            "metaData": {
                "isPreset": false,
                "schemaVersion": "1.0",
                "isHidden": false
            },
            "style": {
                "properties": {
                    "brd": "color_15",
                    "brw": "0px",
                    "rd": "0px",
                    "shd": "0 1px 4px rgba(0, 0, 0, 0.6);"
                },
                "propertiesSource": {
                    "brd": "theme",
                    "brw": "value",
                    "rd": "value",
                    "shd": "value"
                },
                "groups": {}
            },
            "componentClassName": "",
            "pageId": "",
            "compId": "",
            "styleType": "system",
            "skin": "wysiwyg.viewer.skins.video.VideoDefault"
        };
        return newStyle;
    }

    function createTxtNewStyle() {
        return {
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
                "propertiesSource": {},
                groups: {}
            }
        };
    }

    function addMissingStyleIfNeeded(themeData) {
        if (!themeData.v2) {
            var newStyle = createDefaultWixAppsVideoStyle();
            themeData.v2 = _.cloneDeep(themeData.vl) || newStyle;
        }

        if (!themeData.txtNew) {
            themeData.txtNew = createTxtNewStyle();
        }
    }

    function fixCorruptStyle(themeData) {
        _.forOwn(themeData, function (value) {
            CORRUPT_STYLES_FIXER['*'](value);
            if (CORRUPT_STYLES_FIXER[value.skin]) {
                CORRUPT_STYLES_FIXER[value.skin](value);
            }
        });

        if (shouldMigrateTextStyle && themeData.txtNew.skin === 'wysiwyg.viewer.skins.WRichTextSkin') {
            themeData.txtNew.skin = 'wysiwyg.viewer.skins.WRichTextNewSkin';
        }
    }

    /**
     * @exports utils/dataFixer/plugins/stylesFixer
     * @type {{exec: exec}}
     */
    var exports = {
        exec: function (pageJson) {
            var themeData = pageJson.data && pageJson.data.theme_data;
            if (!_.isEmpty(themeData)) {
                addMissingStyleIfNeeded(themeData);
                fixCorruptStyle(themeData);
                _.forEach(themeData, function (style) {
                    fixStyleParamsIfNeeded(style);
                });
            }
        }
    };

    return exports;
});
