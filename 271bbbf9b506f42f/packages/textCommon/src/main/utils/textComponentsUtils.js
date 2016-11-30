define(['lodash', 'coreUtils', 'textCommon/utils/textTransforms', 'experiment'], function(_, coreUtils, textTransforms, experiment) {
    'use strict';
    var anchorTagsGenerator = coreUtils.anchorTagsGenerator;

    function _convertDataQueryLinksIntoHtmlAnchors(text, linkList, renderLink, linkRenderInfo, rootNavigationInfo) {
        var links = _.transform(linkList, function (acc, linkData) {
            acc['#' + linkData.id] = linkData;
        }, {});

        return text.replace(/<a ([^>]*)dataquery="([^"]+)"([^>]*)>/g, function (full, preAttributes, dataQuery, postAttributes) {
            var anchorData = linkRenderInfo ?
                renderLink(links[dataQuery], linkRenderInfo, rootNavigationInfo) :
                renderLink(links[dataQuery]);

            return '<a ' + preAttributes + _.map(anchorData, function (v, k) {
                return k + '="' + v + '"';
            }).join(" ") + postAttributes + '>';
        });
    }

    function _mobileTextTransformIfNeeded(text, options) {
        if (!options.isMobileView) {
            return text;
        }

        text = textTransforms.applyMobileAdjustments(text, options);
        return text;
    }

    function _createImpliedLinks(params) {
        var includedPatterns = anchorTagsGenerator.getIncludedPatterns(experiment, params.isMobileView);
        return anchorTagsGenerator.generateAnchorsInHtml(params.htmlContent, includedPatterns);
    }

    return {
        convertDataQueryLinksIntoHtmlAnchors: _convertDataQueryLinksIntoHtmlAnchors,
        mobileTextTransformIfNeeded: _mobileTextTransformIfNeeded,
        createImpliedLinks: _createImpliedLinks
    };
});
