/**
 * Created by talm on 18/08/15.
 */
define(['lodash', 'documentServices/component/component', 'documentServices/layouters/layouters'], function (_, component, layouters) {
    'use strict';

    function isCompResizing(oldLayout, newLayout) {
        return (_.isNumber(newLayout.width) && newLayout.width !== oldLayout.width) || (_.isNumber(newLayout.height) && newLayout.height !== oldLayout.height);
    }

    function getCurrentSlideLayoutToUpdate(slideShowCurrLayout, slideShowLayoutToUpdate){
        var currSlideNewLayout = _.pick(slideShowLayoutToUpdate, ['width', 'height']);
        //remove box parent offset (slides are relative to their box parent and the parent will call keepChildrenInPlace later on)
        if (_.isNumber(slideShowLayoutToUpdate.x)){
            currSlideNewLayout.x = slideShowLayoutToUpdate.x - slideShowCurrLayout.x;
        }
        if (_.isNumber(slideShowLayoutToUpdate.y)){
            currSlideNewLayout.y = slideShowLayoutToUpdate.y - slideShowCurrLayout.y;
        }
        return currSlideNewLayout;
    }

    return function (privateServices, compPointer, newLayoutToUpdate, updateCompLayoutCallback) {
        var slideShowCurrLayout = component.layout.get(privateServices, compPointer);

        if (isCompResizing(slideShowCurrLayout, newLayoutToUpdate) && _.isFunction(updateCompLayoutCallback)){ //no need for slides changes on position change
            var boxSlides = layouters.getNonMasterChildren(privateServices, compPointer);
            var currSlideNewLayout = getCurrentSlideLayoutToUpdate(slideShowCurrLayout, newLayoutToUpdate);
            _.forEach(boxSlides, function (slide) {
                updateCompLayoutCallback(privateServices, slide, currSlideNewLayout);
            });
        }
    };
});
