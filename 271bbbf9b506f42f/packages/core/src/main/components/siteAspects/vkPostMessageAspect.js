define(['core/core/siteAspectsRegistry', 'lodash'], function(/** core */ siteAspectsRegistry, _) {
    'use strict';

    function onPostMessage(e) {
        var msgData;

        try {
            msgData = JSON.parse(e.data);
        } catch (exception) {
            return;
        }

        propagateToRegisteredEvents.call(this, msgData.id, msgData);
    }

    function propagateToRegisteredEvents(postBackCompId, data) {
        _.forEach(this._registeredCompIds, function(compId){
            if (postBackCompId === compId) {
                var listener = this._siteAPI.getComponentById(compId);
                if (!listener) {
                    delete this._registeredCompIds[compId];
                    return;
                }
                if (listener.onVKPostMessage) {
                    listener.onVKPostMessage(data);
                }
            }
        }, this);
    }


    /**
     *
     * @constructor
     * @param {core.SiteAspectsSiteAPI} siteAPI
     */
    var Aspect = function (siteAPI){
        siteAPI.registerToMessage(onPostMessage.bind(this));

        this._siteAPI = siteAPI;
        this._registeredCompIds = {};
    };

    Aspect.prototype = {
        registerToPostMessage: function (comp) {
            this._registeredCompIds[comp.props.id] = comp.props.id;
        },
        unRegisterToPostMessage: function (comp) {
            delete this._registeredCompIds[comp.props.id];
        }
    };

    siteAspectsRegistry.registerSiteAspect('vkPostMessage', Aspect);
});
