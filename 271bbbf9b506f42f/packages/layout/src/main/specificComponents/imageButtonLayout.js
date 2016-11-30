define(['lodash', 'layout/util/layout', 'layout/specificComponents/imageLayout', 'imageClientApi'], function (_, /** layout.layout */ layout, imageLayout, imageClientApi) {
    'use strict';

    var IMAGES_SKIN_PARTS = ['defaultImage', 'hoverImage', 'activeImage'];

    function getContainerOriginalSize(id, measureMap) {
        return {
            width: measureMap.width[id],
            height: measureMap.height[id]
        };
    }

    function patchImage(imageSkinPart, id, patchers, measureMap, structureInfo, siteData, containerSize) {
        var imgDataItem = structureInfo.dataItem[imageSkinPart];
        if (!imgDataItem) {
            return;
        }

        var imgId = id + imageSkinPart;
        var imageData = _.defaults({displayMode: imageClientApi.fittingTypes.LEGACY_FULL}, imgDataItem);
        imageLayout.patchNodeImage(imgId, patchers, measureMap, siteData, imageData, containerSize);
    }

    /**
     *
     * @param id
     * @param patchers
     * @param measureMap
     * @param {core.SiteData} siteData
     * @param {layout.structureInfo} structureInfo
     */
    function patchButton(id, patchers, measureMap, structureInfo, siteData) {
        var containerSize = getContainerOriginalSize(id, measureMap);

        _.forEach(IMAGES_SKIN_PARTS, function (imageSkinPart) {
            patchImage(imageSkinPart, id, patchers, measureMap, structureInfo, siteData, containerSize);
        });

        var linkId = id + "link";
        patchers.css(linkId, {
            width: containerSize.width,
            height: containerSize.height
        });
    }

    function getChildrenSkinParts() {
        var childrenSkinParts = _.map(IMAGES_SKIN_PARTS, function (skinPartName) {
            return {pathArray: [skinPartName], type: 'core.components.Image'};
        });

        childrenSkinParts.push(['link']);
        return childrenSkinParts;
    }

    layout.registerRequestToMeasureDom('wysiwyg.common.components.imagebutton.viewer.ImageButton');
    layout.registerRequestToMeasureChildren('wysiwyg.common.components.imagebutton.viewer.ImageButton', getChildrenSkinParts());
    layout.registerSAFEPatcher('wysiwyg.common.components.imagebutton.viewer.ImageButton', patchButton);
});
