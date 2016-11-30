define(['core', 'lodash'], function (core, _) {
    'use strict';

    /** @type core.core.dataRequirementsChecker */
    var dataRequirementsChecker = core.dataRequirementsChecker;
    var DEFAULT_SHAPE = '<svg><g></g></svg>';
    var SVG_ROOT = 'svgShapes';

    function getSvgUri(version, svgHash, shapeName) {
        return svgHash + (version === 1 ? '_svgshape.v1.' + shapeName : '') + '.svg';
    }

    function shapeSkinNameToUrl(mediaRootUrl, shapeSkinName) {
        var partsArr = shapeSkinName.replace(/^.*\//, '').split(".");
        var version = (partsArr[1] === 'v1' ? 1 : 2);
        var svgHash = partsArr[2].replace(/svg_/i, '');
        var svgName = partsArr[3];
        var svgUri = getSvgUri(version, svgHash, svgName);

        return mediaRootUrl + 'shapes/' + svgUri;
    }


    function requirementChecker(mediaRootUrl, loadedSvgShapes, skinNames) {
        return _.reduce(skinNames, function(requests, skinName) {
            if (_.has(loadedSvgShapes, skinName) || skinName === 'skins.viewer.svgshape.SvgShapeDefaultSkin') {
                return requests;
            }
            return requests.concat({
                destination: [SVG_ROOT, skinName],
                url: shapeSkinNameToUrl(mediaRootUrl, skinName),
                dataType: 'html',
                error: function () {
                    // set data to a default, empty shape
                    loadedSvgShapes[skinName] = DEFAULT_SHAPE;
                }
            });

        }, []);
    }

    function checkRequirements(siteData, compInfo) {
        return requirementChecker(siteData.serviceTopology.mediaRootUrl, siteData[SVG_ROOT], compInfo.skins);
    }

    dataRequirementsChecker.registerCheckerForCompType('wysiwyg.viewer.components.svgshape.SvgShape', checkRequirements);

    dataRequirementsChecker.registerCheckerForCompType('wysiwyg.viewer.components.PopupCloseIconButton', checkRequirements);


    //return object is for testing only
    return {
        requirementChecker: requirementChecker,
        DEFAULT_SHAPE: DEFAULT_SHAPE,
        SVG_ROOT: SVG_ROOT
    };
});
