define(['lodash'], function (_) {
    'use strict';

    var TINY_MENU_SKIN = "wysiwyg.viewer.skins.mobile.TinyMenuSkin";

    function applyTinyMenuDefaults(styleData) {
        if (styleData.skin !== TINY_MENU_SKIN || _.isUndefined(styleData.style) || _.isUndefined(styleData.style.properties)) {
            return;
        }

        var defaults = [
            ['bg', 'bgDrop'],
            ['bg', 'bgOpen'],
            ['txt', 'bordercolor'],
            ['txt', 'iconcolor'],
            ['bordercolor', 'borderColorSelected']
        ];

        var prop = styleData.style.properties;
        var propSource = styleData.style.propertiesSource;

        function applyDefault(map, key, val) {
            if (!_.isUndefined(map) && !_.isUndefined(map[key])) {
                map[val] = map[val] || map[key];
            }
        }


        _.forEach(defaults, function(def) {
            var key = def[0];
            var val = def[1];

            applyDefault(prop, key, val);
            applyDefault(propSource, key, val);

            key = 'alpha-' + key;
            val = 'alpha-' + val;

            applyDefault(prop, key, val);
            applyDefault(propSource, key, val);
        });

    }

    /**
     * @exports utils/dataFixer/plugins/tinyMenuSkinBackgroundFixer
     * @type {{exec: exec}}
     */
    var exports = {
        exec: function (pageJson) {
            var themeData = pageJson.data && pageJson.data.theme_data;
            if (!_.isEmpty(themeData)) {
                _.forEach(themeData, applyTinyMenuDefaults);
            }
        }
    };

    return exports;
});
