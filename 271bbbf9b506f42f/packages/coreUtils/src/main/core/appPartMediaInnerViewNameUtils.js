define(['lodash'], function (_) {
    'use strict';


    var appPartMediaInnerViewNameUtils = {

        getMediaInnerViewNames: function () {
            return [
                'FeaturedInner',
                'FeaturedInnerMobile',
                'MediaInner',
                'MediaInnerCustom',
                'PostsListMediaInner',
                'SinglePostMediaInner'
            ];
        },


        isMediaInnerViewName: function (viewName) {
            var mediaInnerViewNames = appPartMediaInnerViewNameUtils.getMediaInnerViewNames();
            return _.includes(mediaInnerViewNames, viewName);
        }

    };


    return appPartMediaInnerViewNameUtils;
  
});
