define(["zepto", "wixappsCore", 'wixappsBuilder'], function ($, /** wixappsCore */ wixapps, /** wixappsBuilder */wixappsBuilder) {
        'use strict';
        var global;

        function setState(globalContext) {
            if (globalContext) {
                global = globalContext;
            }
        }

        function getDescriptor(siteData, partData) {
            var appService = siteData.getClientSpecMapEntry(partData.appInnerID);
            var packageName = appService.packageName || appService.type;
            return wixapps.wixappsDataHandler.getDescriptor(siteData, packageName);
        }

        function isPageBased(dataQuery) {
            var siteData = global.rendered.props.siteData;
            var partData = siteData.getDataByQuery(dataQuery);
            var repo = getDescriptor(siteData, partData);
            var dataSelectorDefinition = wixappsBuilder.appRepo.getDataSelectorDefinition(repo, partData.appPartName);

            return dataSelectorDefinition.logicalTypeName === "IB.PageSelectedItem";
        }

        function getAppPartDescriptorId(dataQuery) {
            var siteData = global.rendered.props.siteData;
            var partData = siteData.getDataByQuery(dataQuery);

            return partData.appPartName;
        }

        function getViewName(compId) {
            var $inlineContent = $('#' + compId + 'inlineContent');
            var $rootProxy = $('[data-vcview]', $inlineContent).first();
            return $rootProxy.attr('data-vcview');
        }

        function getCartData() {
            var siteData = global.rendered.props.siteData;

            return siteData.wixapps.ecommerce.items.cart;
        }

        return {
            setState: setState,
            isPageBased: isPageBased,
            getAppPartDescriptorId: getAppPartDescriptorId,
            getViewName: getViewName,
            getCartData: getCartData
        };
    }
);