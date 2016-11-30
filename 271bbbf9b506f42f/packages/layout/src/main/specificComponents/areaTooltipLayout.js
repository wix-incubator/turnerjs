/**
 * Adjusts the tooltip position by computing top and left shifts (based on the component dimensions) and setting as an
 * inline style. Shift calculation formulas are taken from the original viewer component.
 * @see components/areaTooltip/areaTooltip
 * @author yevhenp (Yevhen Pavliuk)
 */
define(['layout/util/layout'], function (/** layout.layout */ layout) {
    'use strict';

    layout.registerCustomMeasure("wysiwyg.common.components.areatooltip.viewer.AreaTooltip", function(compId, measureMap){
        var contentId = compId + 'content';
        measureMap.custom[compId] = measureMap.height[compId] / 2 - measureMap.height[contentId] / 2;
    });

    layout.registerSAFEPatcher('wysiwyg.common.components.areatooltip.viewer.AreaTooltip',
        function (compId, patchers, measureMap, structureData) {
            var contentId, tooltipId, tooltipLeftShift, tooltipTopShift;

            tooltipId = compId + 'tooltip';
            if (!measureMap.height[tooltipId]) {  // Zero height means that the tooltip is hidden.
                return;                           // There is no sense to re-layout a hidden tooltip.
            }

            contentId = compId + 'content';
            var tooltipPosition = structureData.propertiesItem.tooltipPosition;
            switch (tooltipPosition) {
                case 'top':
                    tooltipTopShift = -measureMap.height[contentId] - 14 + 'px';
                    tooltipLeftShift = 0;
                    break;

                case 'right':
                    tooltipTopShift = measureMap.custom[compId] + 'px';
                    tooltipLeftShift = measureMap.width[compId] + 14 + 'px';
                    break;

                case 'bottom':
                    tooltipTopShift = measureMap.height[compId] + 14 + 'px';
                    tooltipLeftShift = 0;
                    break;

                case 'left':
                    tooltipTopShift = measureMap.custom[compId] + 'px';
                    tooltipLeftShift = '-414px';
                    break;

                default:
                    return;
            }
            patchers.css(tooltipId, {
                top: tooltipTopShift,
                left: tooltipLeftShift
            });
        });

    layout.registerRequestToMeasureChildren('wysiwyg.common.components.areatooltip.viewer.AreaTooltip', [
        ['tooltip'],  // Does need to be measured, but it is required to be presented in the nodes map.
        ['content']
    ]);
});
