/**
 * Created by eitanr on 6/24/14.
 */
define([
    'lodash',
    'zepto',
    'utils',
    'layout/util/layout',
    'layout/specificComponents/svgShape/svgScaler'
], function (_, $, utils, /** layout.layout */layout, svgScaler) {
    "use strict";

    var viewBoxTemplate = _.template('${x} ${y} ${width} ${height}');

    /**
     * store box boundaries and original viewbox
     * @param siteData
     * @param {HTMLElement} svgElem
     * @param {string} skinName
     * @param {object} siteData
     */
    function storeSVGMeasuresInSiteData(svgElem, skinName, siteData) {
        siteData.shapesBoundaries = siteData.shapesBoundaries || {};
        var boxBoundaries;
        if (!siteData.shapesBoundaries[skinName]){
            boxBoundaries = _.pick(svgElem.getBBox(), ['x', 'y', 'width', 'height']);
            if (_.some(boxBoundaries)) {
                siteData.shapesBoundaries[skinName] = {
                    boxBoundaries: boxBoundaries
                };
            }
        }
    }

    function setOriginalAspectRatioInSiteData(siteData, skinName, boundingBox) {
        var aspectRatio = boundingBox.width / boundingBox.height;
        siteData.shapesOriginalAspectRatio = siteData.shapesOriginalAspectRatio || {};
        siteData.shapesOriginalAspectRatio[skinName] = siteData.shapesOriginalAspectRatio[skinName] || aspectRatio;
    }

    /**
     *
     * @param {{x: number, y: number, width: number, height: number}} boxBoundaries
     * @param {number} strokeWidth
     * @param {{width: number, height: number}} size, the target dom size
     * @param {boolean} maintainAspectRatio
     */
    function getSvgScaleProps(boxBoundaries, strokeWidth, size, maintainAspectRatio){

        var scaledStroke = strokeWidth;
        var viewBox;
        var preserveAspectRatio = maintainAspectRatio ? 'xMidYMid meet' : 'none';
        var targetSize = size;
        // does browser supports css 'vector-effect: non-scaling-stroke'
        var isVectorEffect = utils.svgFeatureDetection.flags().isVectorEffect;

        if (!strokeWidth) {

            viewBox = boxBoundaries;

        } else if (isVectorEffect){

            viewBox = getScaledViewBox(boxBoundaries, strokeWidth, size, maintainAspectRatio);

        } else {

            viewBox = getScaledViewBox(boxBoundaries, strokeWidth, size, maintainAspectRatio);
            scaledStroke = getScaledStroke(boxBoundaries, strokeWidth, size);

        }

        return {
            viewBox: viewBoxTemplate(viewBox),
            strokeWidth: scaledStroke,
            size: targetSize,
            preserveAspectRatio: preserveAspectRatio
        };
    }

    function getScaledStroke(boxBoundaries, strokeWidth, size) {
        var scale = Math.min((size.width - strokeWidth) / boxBoundaries.width, (size.height - strokeWidth) / boxBoundaries.height);
        return strokeWidth * (1 / scale);
    }

    /**
     *
     * @param {{x: number, y: number, width: number, height: number}} boxBoundaries
     * @param {number} strokeWidth
     * @param {{width: number, height: number}} size, the target dom size
     * @param {boolean} maintainAspectRatio
     */
    function getScaledViewBox(boxBoundaries, strokeWidth, size, maintainAspectRatio) {
        var wScale, hScale, width, height;
        if (!maintainAspectRatio) {
            // scale factor
            wScale = (size.width - strokeWidth) / boxBoundaries.width;
            hScale = (size.height - strokeWidth) / boxBoundaries.height;

        } else {
            // scale factor
            wScale = hScale = Math.min((size.width - strokeWidth) / boxBoundaries.width, (size.height - strokeWidth) / boxBoundaries.height);
        }
        // viewBox values
        width = size.width / wScale;
        height = size.height / hScale;
        return {
            width: width,
            height: height,
            x: boxBoundaries.x - (width - boxBoundaries.width) / 2,
            y: boxBoundaries.y - (height - boxBoundaries.height) / 2
        };
    }

    function isPolyfillScaleNeeded(strokeWidth, maintainAspectRatio){
        // does browser supports css 'vector-effect: non-scaling-stroke'
        var isVectorEffect = utils.svgFeatureDetection.flags().isVectorEffect;
        return strokeWidth > 0 && maintainAspectRatio === false && !isVectorEffect;
    }


    function measureShape(id, measureMap, nodesMap, siteData, structureInfo) {
        var skinName = _.get(structureInfo, ['styleItem', 'skin']);
        var svgElem = nodesMap[id] && nodesMap[id].getElementsByTagName('svg')[0];
        if (!skinName || !svgElem) {
            return;
        }
        nodesMap[id + 'svg'] = svgElem;

        var maintainAspectRatio = _.get(structureInfo, ['propertiesItem', 'maintainAspectRatio']);
        var strokeWidth = parseInt(_.get(structureInfo, ['styleItem', 'style', 'properties', 'strokewidth'], 1), 10);

        if (isPolyfillScaleNeeded(strokeWidth, maintainAspectRatio)){
            measureMap.custom[id] = {};
            var gElem = nodesMap[id + 'svg-g'] = svgElem.getElementsByTagName('g')[0];
            measureMap.custom[id].boundingBox = gElem ? gElem.getBBox() : {};
            setOriginalAspectRatioInSiteData(siteData, skinName, measureMap.custom[id].boundingBox);
        } else {
            storeSVGMeasuresInSiteData(svgElem, skinName, siteData);
        }
    }

    /**
     *
     * @param id
     * @param nodesMap
     * @param measureMap
     * @param {layout.structureInfo} structureInfo
     * @param siteData
     */
    function layoutShape(id, nodesMap, measureMap, structureInfo, siteData) {
        var svgElement = nodesMap[id + 'svg'];
        var themeData = structureInfo.styleItem;
        if (!svgElement || !themeData) {
            return;
        }
        var compProps = structureInfo.propertiesItem;
        var maintainAspectRatio = compProps && compProps.maintainAspectRatio;
        var strokeWidth = parseInt(_.get(themeData, ['style', 'properties', 'strokewidth'], 1), 10);
        var requestedSize;

        if (isPolyfillScaleNeeded(strokeWidth, maintainAspectRatio)){

            requestedSize = {
                width: measureMap.width[id] - strokeWidth,
                height: measureMap.height[id] - strokeWidth
            };
            svgScaler.scale(svgElement, requestedSize, measureMap.custom[id].boundingBox, strokeWidth, maintainAspectRatio);


        } else {
            var shapeBoundaries = _.get(siteData, ['shapesBoundaries', themeData.skin]);
            if (!shapeBoundaries) {
                return;
            }
            requestedSize = {
                width: measureMap.width[id],
                height: measureMap.height[id]
            };
            var svgScaleProps = getSvgScaleProps(
                shapeBoundaries.boxBoundaries,
                strokeWidth,
                requestedSize,
                maintainAspectRatio);

            $(svgElement).css(_.pick(svgScaleProps, ['strokeWidth', 'size']));
            $(svgElement).attr(_.pick(svgScaleProps, ['preserveAspectRatio', 'viewBox']));

        }
    }

    layout.registerCustomMeasure("wysiwyg.viewer.components.svgshape.SvgShape", measureShape);
    layout.registerPatcher("wysiwyg.viewer.components.svgshape.SvgShape", layoutShape);
    layout.registerCustomMeasure("wysiwyg.viewer.components.PopupCloseIconButton", measureShape);
    layout.registerPatcher("wysiwyg.viewer.components.PopupCloseIconButton", layoutShape);

    return {};
});
