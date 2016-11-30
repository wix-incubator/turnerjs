define([
    'galleriesCommon/utils/galleriesHelperFunctions',
    'galleriesCommon/utils/matrixCalculations',
    'galleriesCommon/utils/matrixScalingCalculations',
    'galleriesCommon/mixins/galleryAutoPlayMixin'
], function (galleriesHelperFunctions, matrixCalculations, matrixScalingCalculations, galleryAutoPlayMixin) {
    'use strict';

    return {
        utils: {
            galleriesHelperFunctions: galleriesHelperFunctions,
            matrixCalculations: matrixCalculations,
            matrixScalingCalculations: matrixScalingCalculations
        },
        mixins: {
            galleryAutoPlayMixin: galleryAutoPlayMixin
        }
    };
});
