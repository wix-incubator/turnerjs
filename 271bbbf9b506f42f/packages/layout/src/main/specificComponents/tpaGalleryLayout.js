define(['zepto', 'lodash', 'layout/util/layout', 'layout/util/calculateScreenWidthDimensions'], function ($, _, /** layout.layout */ layout, calculateScreenWidthDimensions) {
    'use strict';

    function runMultiple(callbacks) {
        return function (id, measureMap, nodesMap, siteData, structureInfo) {
            callbacks.forEach(function (callback) {
                callback(id, measureMap, nodesMap, siteData, structureInfo);
            });
        };
    }

    function measureTPAGallery(id, measureMap) {
        measureMap.width[id] = Math.max(10, measureMap.width[id]);
        measureMap.minHeight[id] = 10;
    }

    function patchTPAGallery(id, patchers, measureMap) {
        patchers.css(id + 'iframe', {
            width: measureMap.width[id],
            height: measureMap.height[id]
        });
    }

    function updateDimensions(id, patchers, measureMap, siteData, structureInfo) {
        var dimensions = calculateScreenWidthDimensions(measureMap, siteData, structureInfo.rootId);

        patchers.css(id, {
            width: dimensions.width + 'px',
            left: dimensions.left + 'px'
        });

        patchers.attr(id + 'iframe', {
            style: {
                width: dimensions.width + 'px'
            }
        });

        //TODO: remove this! why is this here?
        measureMap.width[id] = dimensions.width;
        measureMap.left[id] = dimensions.left;
    }

    function measureCarouselGallery(id, measureMap) {
        var ratio = 0.33;
        measureMap.height[id] = ratio * measureMap.width[id];
    }

    function measureCollageGallery(id, measureMap, nodesMap, siteData, structureInfo) {
        var props = structureInfo.propertiesItem;
        if (!props.fitToScreenWidth) {
            return;
        }
        var compNode = nodesMap[id];
        var dimensions = calculateScreenWidthDimensions(measureMap, siteData, structureInfo.rootId);


        compNode.style.width = dimensions.width + 'px';
        compNode.style.left = dimensions.left + 'px';
        measureMap.width[id] = dimensions.width;
        measureMap.left[id] = dimensions.left;
    }

    function measureFreestyleGallery(id, measureMap, nodesMap, siteData, structureInfo) {
        if (structureInfo.propertiesItem.orientation === 'vertical') {
            measureHeightFromIframe(id, measureMap, nodesMap);
        }
    }

    function measureHeightFromIframe(id, measureMap, nodesMap) {
        measureMap.height[id] = _.first($(nodesMap[id]).find('iframe')).offsetHeight;
    }

    function patchTpaStripGallery(id, patchers, measureMap, structureInfo, siteData) {
        updateDimensions(id, patchers, measureMap, siteData, structureInfo);
    }

    layout.registerRequestToMeasureChildren('tpa.viewer.components.StripSlideshow', [['iframe']]);
    layout.registerRequestToMeasureChildren('tpa.viewer.components.StripShowcase', [['iframe']]);
    layout.registerRequestToMeasureChildren('tpa.viewer.components.Collage', [['iframe']]);
    layout.registerRequestToMeasureChildren('tpa.viewer.components.Honeycomb', [['iframe']]);
    layout.registerRequestToMeasureChildren('tpa.viewer.components.Accordion', [['iframe']]);
    layout.registerRequestToMeasureChildren('tpa.viewer.components.Masonry', [['iframe']]);
    layout.registerRequestToMeasureChildren('tpa.viewer.components.Impress', [['iframe']]);
    layout.registerRequestToMeasureChildren('tpa.viewer.components.Freestyle', [['iframe']]);
    layout.registerRequestToMeasureChildren('tpa.viewer.components.Thumbnails', [['iframe']]);

    layout.registerRequestToMeasureChildren('wysiwyg.viewer.components.tpapps.TPA3DGallery', [['iframe']]);
    layout.registerRequestToMeasureChildren('wysiwyg.viewer.components.tpapps.TPA3DCarousel', [['iframe']]);

    layout.registerSAFEPatcher('tpa.viewer.components.StripShowcase', patchTpaStripGallery);
    layout.registerSAFEPatcher('tpa.viewer.components.StripSlideshow', patchTpaStripGallery);
    layout.registerSAFEPatcher('tpa.viewer.components.Collage', patchTPAGallery);
    layout.registerSAFEPatcher('tpa.viewer.components.Accordion', patchTPAGallery);
    layout.registerSAFEPatcher('tpa.viewer.components.Impress', patchTPAGallery);
    layout.registerSAFEPatcher('tpa.viewer.components.Freestyle', patchTPAGallery);
    layout.registerSAFEPatcher('tpa.viewer.components.Thumbnails', patchTPAGallery);
    layout.registerSAFEPatcher('tpa.viewer.components.Honeycomb', patchTPAGallery);
    layout.registerSAFEPatcher('tpa.viewer.components.Masonry', patchTPAGallery);
    layout.registerSAFEPatcher('wysiwyg.viewer.components.tpapps.TPA3DGallery', patchTPAGallery);
    layout.registerSAFEPatcher('wysiwyg.viewer.components.tpapps.TPA3DCarousel', patchTPAGallery);

    layout.registerCustomMeasure('tpa.viewer.components.Collage', runMultiple([measureHeightFromIframe, measureCollageGallery, measureTPAGallery]));
    layout.registerCustomMeasure('tpa.viewer.components.Masonry', runMultiple([measureHeightFromIframe, measureTPAGallery]));
    layout.registerCustomMeasure('tpa.viewer.components.Honeycomb', measureTPAGallery);
    layout.registerCustomMeasure('tpa.viewer.components.Accordion', measureTPAGallery);
    layout.registerCustomMeasure('tpa.viewer.components.Impress', measureTPAGallery);
    layout.registerCustomMeasure('tpa.viewer.components.Freestyle', runMultiple([measureFreestyleGallery, measureTPAGallery]));
    layout.registerCustomMeasure('tpa.viewer.components.StripShowcase', measureTPAGallery);
    layout.registerCustomMeasure('tpa.viewer.components.StripSlideshow', measureTPAGallery);
    layout.registerCustomMeasure('tpa.viewer.components.Thumbnails', measureTPAGallery);
    layout.registerCustomMeasure('wysiwyg.viewer.components.tpapps.TPA3DGallery', measureTPAGallery);
    layout.registerCustomMeasure('wysiwyg.viewer.components.tpapps.TPA3DCarousel', runMultiple([measureTPAGallery, measureCarouselGallery]));
});
