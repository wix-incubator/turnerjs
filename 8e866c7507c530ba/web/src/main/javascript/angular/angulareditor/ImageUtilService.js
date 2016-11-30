W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    angular.module('angularEditor').factory('imageUtils', function ImageUtils() {
        var imageUtils = null;
        W.Classes.getClass("core.components.image.ImageUrlNew", function (ImageUrlNew) {
            if (ImageUrlNew) {
                imageUtils = new ImageUrlNew();
            }
        });

        return {
            getUrlForPyramid: imageUtils && imageUtils._getUrlForPyramid.bind(imageUtils)
        };
    });

});