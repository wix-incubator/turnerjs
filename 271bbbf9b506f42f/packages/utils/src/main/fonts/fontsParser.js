define(['lodash'], function(_) {
    "use strict";

    function collectFontsFromTextDataArray(textDataArray) {
        var fontOverridesRegex = /(<[^>]+["']font-family:\s*)([^,;]+)([,;])/g;

        return _.reduce(textDataArray, function (acc, textData) {
            fontOverridesRegex.lastIndex = 0;
            var match;
            while ((match = fontOverridesRegex.exec(textData))) {
                acc.push(match[2].replace(/['"]/g, ''));
            }
            return acc;
        }, []);
    }

    return {
        collectFontsFromTextDataArray: collectFontsFromTextDataArray
    };
});