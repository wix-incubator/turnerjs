define(["lodash", "utils"], function (_, /** utils */utils) {
    'use strict';

    var THINGY_CHAR = "@";

    var localizer = {
        macroPattern: new RegExp("^" + THINGY_CHAR + "[0-9a-zA-Z_\\-\\.]*" + THINGY_CHAR + "$"),
        thingyPattern: new RegExp(THINGY_CHAR, "g")
    };

    function getTranslatedValue(key, map) {
        if (_.has(map, key)) {
            return map[key];
        }
        return "[" + key + "] - not found";
    }

    return {
        getLocalizationBundleForPackage: function(dataAspect, packageName, siteData){
            var lang = utils.wixUserApi.getLanguage(siteData.requestModel.cookie, siteData.currentUrl).toLowerCase();
            var descriptor = dataAspect.getDescriptor(packageName);
            return descriptor && (descriptor.lang[lang] || descriptor.lang.en);
        },

        localize: function (str, localizationBundle) {
            var macro, key, res;

            while ((macro = localizer.macroPattern.exec(str)) !== null) {
                macro = macro[0];
                key = macro.replace(localizer.thingyPattern, "");
                res = getTranslatedValue(key, localizationBundle);
                str = str.replace(macro, res);
            }

            return str;
        }
    };
});
