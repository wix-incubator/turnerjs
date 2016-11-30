/**
 * Created by eitanr on 6/24/14.
 */
define(['layout/util/layout'], function (/** layout.layout */ layout) {
    "use strict";
    var richTextCompName = "wysiwyg.viewer.components.WRichText";



    function patchNodeRichText(id, patchers) {
        patchers.css(id, {height: ''});
    }

    layout.registerSAFEPatcher(richTextCompName, patchNodeRichText);

    layout.registerCustomMeasure(richTextCompName, function(id, measureMap, nodesMap, siteData, structureInfo){
        var el = nodesMap[id];

        measureMap.minHeight[id] = el.offsetHeight;

        if (structureInfo.propertiesItem && structureInfo.propertiesItem.packed) {
            measureMap.height[id] = el.offsetHeight;
        }
    });

    layout.registerRequestToMeasureDom(richTextCompName);

    return {};
});
