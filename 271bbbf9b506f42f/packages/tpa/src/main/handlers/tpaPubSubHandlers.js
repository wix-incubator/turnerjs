/*eslint identifier:0*/
define(['tpa/utils/tpaUtils', 'utils', 'tpa/bi/errors'], function(tpaUtils, utils, biErrors) {
    'use strict';

    var logger = utils.logger;

    return {
        registerEventListener: function (siteAPI, msg) {
            siteAPI.getSiteAspect('tpaPubSubAspect').subscribe(msg);
        },

        publish: function (siteAPI, msg) {
            var msgData = msg.data;
            var compId = msg.compId;
            var appDefId = tpaUtils.getAppDefId(siteAPI, compId);

            if (appDefId) {
                msgData.eventKey = tpaUtils.stripPubSubPrefix(msgData.eventKey);

                siteAPI.getSiteAspect('tpaPubSubAspect').publish(appDefId, compId, msgData);
            } else {
                logger.reportBI(siteAPI.getSiteData(), biErrors.SDK_PUBSUB_PUBLISH_ERROR);
            }

        },
        removeEventListener: function (siteAPI, msg) {
            var compId = msg.compId;
            var msgData = msg.data;
            var appDefId = tpaUtils.getAppDefId(siteAPI, compId);
            var event = tpaUtils.stripPubSubPrefix(msgData.eventKey);

            siteAPI.getSiteAspect('tpaPubSubAspect').unsubscribe(appDefId, compId, event);
        }
    };
});