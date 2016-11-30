define(['lodash', 'qaAutomation/plugins/componentsPlugin', 'qaAutomation/api/qaApi', 'qaAutomation/api/domSelectors', 'qaAutomation/api/wixappsQaApi', 'qaAutomation/plugins/wixappsComponentsPlugin', 'wixappsCore'],
    function(_, componentsPlugin, qaApi, getDomSelectors, wixappsQaApi, wixappsComponentsPlugin, wixapps) {
    'use strict';

    function init(global, siteModel){
        componentsPlugin.init(siteModel);
        wixappsComponentsPlugin.init();
        wixapps.wixappsConfiguration.applyAutomationAttributes();
        if (global) {
            qaApi.setState(global);
            global.qaApi = qaApi;
            wixappsQaApi.setState(global);
            global.wixappsQaApi = wixappsQaApi;
        }
    }

    return {
        init: init,
        getDomSelectors: getDomSelectors
    };
});
