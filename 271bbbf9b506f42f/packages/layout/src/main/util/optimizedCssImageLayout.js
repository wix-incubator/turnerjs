define(['lodash', 'zepto', 'utils'],
    function(_, $, utils){
        'use strict';

        var RESIZE_DELAY = 250;
        var balataConsts = utils.balataConsts;


        function didImageChange(currentImageUrlCss, newUrl){
            return !_.includes(currentImageUrlCss, newUrl) || Boolean(currentImageUrlCss) !== Boolean(newUrl);
        }

        function getImageUrlCssFromUri(imageUri, siteData){
            if (imageUri){
                return utils.urlUtils.joinURL(siteData.getStaticMediaUrl(), imageUri);
            }
            return '';
        }


        function cacheCssImageMeasureData(customMeasureData, imageNode){
            var $imageNode = $(imageNode);
            customMeasureData.type = $imageNode.data('type');
            customMeasureData.currentCss = $imageNode.data('image-css'); //zepto .data() parses valid JSON into
            if (customMeasureData.currentCss && _.isString(customMeasureData.currentCss)){
                customMeasureData.currentCss = JSON.parse(customMeasureData.currentCss);
            }
            customMeasureData.previousBackgroundImageCssUrl = $imageNode.css('backgroundImage');
        }

        function updateUrl(patchers, id, imageCssUrl, imageType) {
            if (imageType === balataConsts.BG_IMAGE) {
                patchers.css(id, {
                    backgroundImage: imageCssUrl ? 'url("' + imageCssUrl + '")' : '' //hotfix for #SE-15328, but this simply should be fixed in a better way
                });
            } else {
                patchers.attr(id, {src: imageCssUrl});
            }
        }

        function patchImageUrlForCssImage(id, patchers, customMeasureData, imageCssUrl, siteData) {
            var previousImageCssUrl = customMeasureData.previousBackgroundImageCssUrl;
            siteData.imageResizeHandlers = siteData.imageResizeHandlers || {};
            if (!previousImageCssUrl || !imageCssUrl){
                //CLNT-5379 do not remove this call , its important for safari bg render
                updateUrl(patchers, id, imageCssUrl, customMeasureData.type);
                return;
            } else if (!siteData.imageResizeHandlers[id]) {
                siteData.imageResizeHandlers[id] = _.debounce(updateUrl, RESIZE_DELAY, {trailing: true});
            }
            siteData.imageResizeHandlers[id](patchers, id, imageCssUrl, customMeasureData.type);

        }

        function shouldPatchCss(oldCss, newCss){
            return newCss && (!oldCss || _.some(newCss, function(val, key){
                return val !== oldCss[key];
            }));
        }

        function patchCssImage(customMeasureData, id, patchers, newCss, newUri, siteData){
            if (shouldPatchCss(customMeasureData.currentCss, newCss)){
                patchers.css(id, newCss);
                var allCss = _.defaults(newCss, customMeasureData.currentCss);
                patchers.data(id, {
                    'image-css': JSON.stringify(allCss) //need the JSON to be well-formed, i.e. with double quotes around all properties and values
                });
            }
            var newImageUrl = getImageUrlCssFromUri(newUri, siteData);
            if (didImageChange(customMeasureData.previousBackgroundImageCssUrl, newImageUrl)){
                patchImageUrlForCssImage(id, patchers, customMeasureData, newImageUrl, siteData);
            }
        }

        return {
            cacheCssImageMeasureData: cacheCssImageMeasureData,
            patchCssImage: patchCssImage
        };
});
