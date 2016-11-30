define(['layout/util/layout'], function (layout) {
    'use strict';

    function customFormMixinMeasure(id, measureMap) {
        var wrapperHeight = measureMap.height[id + "wrapper"];
        if (wrapperHeight) {
            measureMap.height[id] = wrapperHeight;
        }
        /*measureMap.maxWidth[id] = 980;
         measureMap.maxHeight[id] = 1024;*/
    }

    function customMeasureContactForm(id, measureMap, nodesMap) {
        customFormMixinMeasure(id, measureMap, nodesMap);
        var contactFormMinWidth = 180;
        measureMap.width[id] = Math.max(measureMap.width[id], contactFormMinWidth);
        measureMap.minWidth[id] = contactFormMinWidth;
        measureMap.minHeight[id] = 180;

    }

    function customMeasureSubscribeForm(id, measureMap) {
        var wrapperHeight = measureMap.height[id + "wrapper"];
        if (wrapperHeight) {
            measureMap.height[id] = wrapperHeight;
        }
    }

    layout.registerCustomMeasure("wysiwyg.viewer.components.ContactForm", customMeasureContactForm);
    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.ContactForm", [
        ["wrapper"]
    ]);
	layout.registerRequestToMeasureDom("wysiwyg.common.components.subscribeform.viewer.SubscribeForm");
    layout.registerRequestToMeasureChildren("wysiwyg.common.components.subscribeform.viewer.SubscribeForm", [
        ["wrapper"]
    ]);
    layout.registerCustomMeasure("wysiwyg.common.components.subscribeform.viewer.SubscribeForm", customMeasureSubscribeForm);
});
