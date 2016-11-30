define(['zepto', 'layout/util/layout'], function ($, layout) {
    "use strict";

    var browserScrollbarWidth;

    function getScrollBarWidth() {
        var $outer = $('<div>').css({visibility: 'hidden', width: 100, overflow: 'scroll'}).appendTo('body');
        var widthWithScroll = $('<div>').css({width: '100%'}).appendTo($outer).width();
        $outer.remove();
        return 100 - widthWithScroll;
    }

    function isWixSite(siteData){
        return siteData.rendererModel.siteInfo.documentType === 'WixSite';
    }

    function shouldFixBodySize(siteData){
        return siteData.isTabletDevice() && isWixSite(siteData);
    }

    function patchBody(patchers, measureMap){
        patchers.css('body', {
            width: measureMap.width.body
        });
    }

    function measureBody(nodesMap, measureMap){
        browserScrollbarWidth = browserScrollbarWidth || getScrollBarWidth();

        var clientWidth = window.document.body.clientWidth;
        var innerWidth = window.innerWidth;
        var bodyWidth = clientWidth;
        if (innerWidth > (clientWidth + browserScrollbarWidth)){
            bodyWidth = innerWidth;
        }

        nodesMap.body = window.document.body;
        measureMap.width.body = bodyWidth;
    }

    function patchSite(id, patchers, measureMap, structureInfo, siteData){
        if (shouldFixBodySize(siteData)){
            patchBody(patchers, measureMap);
        }
    }

    function measureSite(id, measureMap, nodesMap, siteData/*, structureInfo*/){
        if (shouldFixBodySize(siteData)){
            measureBody(nodesMap, measureMap);
        }
    }

    layout.registerCustomMeasure('document', measureSite);
    layout.registerSAFEPatcher('document', patchSite);

});
