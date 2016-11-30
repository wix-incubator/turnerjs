define([
    'lodash',
    'documentServices/constants/constants',
    'documentServices/dataModel/dataModel',
    'documentServices/wixapps/utils/classicsUtils',
    'documentServices/componentsMetaData/metaDataUtils',
    'wixappsClassics',
    'documentServices/wixapps/services/blogUtils',
    'utils',
    'experiment'
], function (_, consts, dataModel, classicsUtils, metaDataUtils, wixappsClassics, blogUtils, utils, experiment) {
    'use strict';

    var blogAppPartNames = utils.blogAppPartNames;

    function getResizableSides(ps, compPointer) {
        var resizableSides = [consts.RESIZE_SIDES.LEFT, consts.RESIZE_SIDES.RIGHT];
        var data = dataModel.getDataItem(ps, compPointer);
        var packageName = classicsUtils.getPackageName(ps, data.appInnerID);
        var partDefinition = classicsUtils.getAppPartDefinition(ps, packageName, data.appPartName);
        if (wixappsClassics.descriptorUtils.doesAllowHeightResize(partDefinition, data.viewName)) {
            resizableSides = resizableSides.concat([consts.RESIZE_SIDES.TOP, consts.RESIZE_SIDES.BOTTOM]);
        }
        return resizableSides;
    }

    function isMasterPageScope(ps, comp){
        return ps.pointers.components.isMasterPage(comp) || ps.pointers.components.isInMasterPage(comp);
    }

    function isChangingScope(ps, compPointer, potentialContainer){
       return isMasterPageScope(ps, compPointer) !== isMasterPageScope(ps, potentialContainer);
    }

    function isCompInList(ps, compPointer, list){
        var compData = dataModel.getDataItem(ps, compPointer);
        var packageName = classicsUtils.getPackageName(ps, compData.appInnerID);

        return packageName === 'blog' && _.includes(list, classicsUtils.getAppPartRole(ps, packageName, compData.appPartName));
    }

    function isAppPartPageFixed(ps, compPointer){
        return isCompInList(ps, compPointer, [
            'BLOG_FEED',
            'SINGLE_POST',
            'RELATED_POSTS'
        ]);
    }

    function isContainable(ps, compPointer, potentialContainer){
        return potentialContainer && !(isChangingScope(ps, compPointer, potentialContainer) && isAppPartPageFixed(ps, compPointer));
    }

    function isStretchable(ps, compPointer) {
        if (experiment.isOpen('sv_blogRelatedPosts')) {
            return isCompInList(ps, compPointer, [
                'POST_GALLERY',
                'RELATED_POSTS'
            ]);
        }

        return isCompInList(ps, compPointer, ['POST_GALLERY']);
    }

    function containableByStructure(ps, comp) {
        var isOnPopup = !metaDataUtils.notContainableByPopup.apply(metaDataUtils, arguments);

        if (experiment.isOpen('sv_blogRelatedPosts')) {
            var isSinglePostPage = blogUtils.isSinglePost(ps, ps.siteAPI.getFocusedRootId());
            var isRelatedPostComponent = comp.data.appPartName === blogAppPartNames.RELATED_POSTS;

            return !(isOnPopup || isRelatedPostComponent && !isSinglePostPage);
        }

        return !isOnPopup;
    }

    function getLayoutLimits(ps, compPointer) {
        var appPartName = dataModel.getDataItem(ps, compPointer).appPartName;

        if (appPartName === blogAppPartNames.HERO_IMAGE) {
            return {minHeight: consts.HERO_IMAGE.MIN_HEIGHT};
        }

        return {};
    }

    return {
        layoutLimits: getLayoutLimits,
        resizableSides: getResizableSides,
        containable: isContainable,
        containableByStructure: containableByStructure,
        canBeStretched: isStretchable
    };
});
