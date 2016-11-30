define(["lodash", "skins", "core"], function (_, skinsPackage, /** core */ core) {
    "use strict";

    var skins = skinsPackage.skins;

    core.styleCollector.registerClassBasedStyleCollector("wysiwyg.viewer.components.MediaRichText", function (structureInfo, themeData, siteData, loadedStyles) {
        var wixCompPattern = /(<img[^>]*wix-comp="([^"]+)"[^>]*>)/g;
        var match;

        /*
            while loop inspired by http://stackoverflow.com/questions/844001/javascript-regex-and-submatches
        */
        /* eslint no-cond-assign:0 */
        while (match = wixCompPattern.exec(structureInfo.dataItem.text)) {
            var innerCompStructure = JSON.parse(match[2].replace(/&quot;/g, "\""));

            var key = '';

            if (innerCompStructure.skin && skins[innerCompStructure.skin]) {
                key = innerCompStructure.skin;
            }

            if (key && !loadedStyles[key]) {
                loadedStyles[key] = "s" + _.size(loadedStyles);
            }
        }
    });
});