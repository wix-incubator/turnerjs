/**
 * Created by Talm on 14/07/2014.
 */
define(['skins', 'lodash', 'galleriesCommon/utils/matrixCalculations'], function (skinsPackage, _, matrixCalculations) {
    'use strict';
    var skins = skinsPackage.skins;

    function getSkinHeightDiff(skinName) {
        var exports = skins[skinName].exports;
        return (exports && exports.heightDiff) || 0;
    }

    function getSkinWidthDiff(skinName) {
        var exports = skins[skinName].exports;
        return (exports && exports.widthDiff) || 0;
    }

    function getGalleryHeight(currentNumberOfRows, newNumberOfRows, margin, skinName, height) {
        var marginBetweenImages = margin;
        var heightDiff = this.getSkinHeightDiff(skinName);
        var itemHeight = matrixCalculations.getItemHeight(margin, height, currentNumberOfRows, heightDiff);
        return Math.floor((newNumberOfRows * itemHeight) + ((newNumberOfRows - 1) * marginBetweenImages)) + heightDiff;
    }

    function getDisplayerHeightDiff(displayerSkinObj, displayerSkinParams, displayMode) {
        var diff = 0;
        var imgHeightDiff = parseInt(displayerSkinParams.imgHeightDiff && displayerSkinParams.imgHeightDiff.value, 10) || 0;
        var topPadding = parseInt(displayerSkinParams.topPadding && displayerSkinParams.topPadding.value, 10) || 0;

        if (imgHeightDiff || topPadding) {
            diff = imgHeightDiff + topPadding;
        } else if (displayerSkinObj && displayerSkinObj.exports) {
            if (displayMode === 'mobileView') {
                diff = _.isNumber(displayerSkinObj.exports.m_heightDiff) ? displayerSkinObj.exports.m_heightDiff : (displayerSkinObj.exports.heightDiff || 0);
            } else {
                diff = displayerSkinObj.exports.heightDiff || 0;
            }
        }
        return diff;
    }

    function getDisplayerWidthDiff(displayerSkinObj, displayMode) {
        var diff = 0;

        if (displayerSkinObj && displayerSkinObj.exports) {
            if (displayMode === 'mobileView') {
                diff = _.isNumber(displayerSkinObj.exports.m_widthDiff) ? displayerSkinObj.exports.m_widthDiff : (displayerSkinObj.exports.widthDiff || 0);
            } else {
                diff = displayerSkinObj.exports.widthDiff || 0;
            }
        }

        return diff;
    }

    return {
        getSkinHeightDiff: getSkinHeightDiff,
        getSkinWidthDiff: getSkinWidthDiff,
        getGalleryHeight: getGalleryHeight,
        getDisplayerHeightDiff: getDisplayerHeightDiff,
        getDisplayerWidthDiff: getDisplayerWidthDiff
    };
});
