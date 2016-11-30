define([
    'lodash',
    'wixCode/services/wixCodeUserScriptsService',
    'wixCode/utils/constants'
], function(_, wixCodeUserScriptsService, constants) {
    'use strict';

    function getWixCodeWidgetsExtraData(messageData, widget, wixCodeModel, wixCodeSpec, siteData) {
        if (messageData.type === 'load_widgets') {

            var extraData = {
                appConfig: {
                    scari: wixCodeModel.signedAppRenderInfo
                }
            };
            if (widget.type !== 'Application') {
                extraData.appConfig.userScript = wixCodeUserScriptsService.getUserScript(widget, wixCodeModel, wixCodeSpec, siteData);
            }
            return extraData;
        }
    }

    function shouldExtandData(widgetData) {
        return widgetData.type !== 'Application' || widgetData.id === 'dataBinding';
    }

    function getExtendedMessage(messageData, wixCodeModel, wixCodeSpec, siteData) {
        // This function gets additional params for the wix code message.
        // When we have more apps, we will write a generic appConfig mechanism
        // and this code will be migrated to that.

        var extension = {
            intent: constants.MESSAGE_INTENT.WIX_CODE_MESSAGE
        };

        if (wixCodeSpec && messageData.widgets) {
            messageData.widgets = _.map(messageData.widgets, function(widgetData){
                return shouldExtandData(widgetData) ? 
                    _.assign({}, widgetData, getWixCodeWidgetsExtraData(messageData, widgetData, wixCodeModel, wixCodeSpec, siteData)) :
                    widgetData;
            });
        }

        return _.defaults({}, messageData, extension);
    }


    return {
        getExtendedMessage: getExtendedMessage
    };

});
