/**
 * Created by eitanr on 6/24/14.
 */
define(['lodash', "layout/util/layout"], function(_, /** layout.layout */ layout) {
    "use strict";

    function measure(id, measureMap/*, nodesMap*/){
        var contentId = id + "content";
        [['width', 'minWidth'], ['height', 'minHeight']].forEach(function(sizePair) {
            var sizeName = sizePair[0],
                minSizeName = sizePair[1];
            if (measureMap[sizeName][contentId] > measureMap[sizeName][id]){
                if (!measureMap[minSizeName]) {
                    measureMap[minSizeName] = {};
                }

                measureMap[sizeName][id] = measureMap[minSizeName][id] = measureMap[sizeName][contentId];
            }
        });
    }

    layout.registerRequestToMeasureChildren('wysiwyg.common.components.domainsearchbar.viewer.DomainSearchBar', [['content']]);
    layout.registerCustomMeasure("wysiwyg.common.components.domainsearchbar.viewer.DomainSearchBar", measure);

    return {};
});
