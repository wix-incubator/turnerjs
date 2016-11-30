define(["wixappsCore", "lodash"], function (/** wixappsCore */ wixapps, _) {
    'use strict';

    function getBoxAlignment(boxAlign) {
        return {css: {"box-align": boxAlign}};
    }

    function invertOrientation(fieldOrientation) {
        return fieldOrientation === "vertical" ? "horizontal" : "vertical";
    }

    function getXaxItemSpacers(spacers) {
        spacers = spacers || {};

        return {
            spacerBefore: spacers['xax-before'] || 0,
            spacerAfter: spacers['xax-after'] || 0
        };
    }

    function getItemSpacers(spacers) {
        spacers = spacers || {};

        return {
            spacerBefore: spacers.before || 0,
            spacerAfter: spacers.after || 0
        };
    }

    function getSpacers(fieldOrientation, compDefSpacers, direction) {
        var itemSpacers = getItemSpacers(compDefSpacers);
        var translatedSpacers = wixapps.spacersCalculator.translateStaticSpacers(itemSpacers, fieldOrientation, direction);
        var xaxItemSpacers = getXaxItemSpacers(compDefSpacers);
        var xaxTranslatedSpacers = wixapps.spacersCalculator.translateStaticSpacersXax(xaxItemSpacers, invertOrientation(fieldOrientation), direction);
        return _.merge(translatedSpacers, xaxTranslatedSpacers);
    }

    function getLinkViewDef(pageLink, itemLink) {
        if (pageLink) {
            return {
                comp: {
                    name: "AppLink",
                    pageId: pageLink,
                    items: []
                }
            };
        }

        if (!itemLink || itemLink._type === "wix:LinkBase") {
            return undefined;
        }

        return {
            value: itemLink,
            comp: {
                name: "Link",
                items: []
            }
        };
    }

    return {
        getSpacers: getSpacers,
        getBoxAlignment: getBoxAlignment,
        getLinkViewDef: getLinkViewDef
    };
});