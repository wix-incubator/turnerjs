define(['lodash', 'core/core/siteAspectsRegistry', 'utils'], function (_, siteAspectsRegistry, utils) {
    'use strict';

    var stringUtils = utils.stringUtils;

    /**
     * component's registry to contain "event types": compIds objects map
     * @type {Object} - supported focus events
     */
    var compsRegistry = {};

    /**
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent|MDN}
     *
     * @type {Array} - supported focus events
     */
    var touchEvents = [
        'touchstart',
        'touchmove',
        'touchend',
        'touchcancel'
    ];

    /**
     * @type {core.SiteAspectsSiteAPI}
     * */
    var siteAspectAPI;

    /**
     *
     * @param {core.SiteAspectsSiteAPI} aspectSiteAPI
     * @implements {core.SiteAspectInterface}
     * @constructor
     */
    function WindowTouchEventsAspect(aspectSiteAPI) {
        siteAspectAPI = aspectSiteAPI;
        register();
    }

    /**
     * creates components registry and registers to all supported touch events
     *
     * @private
     */
    function register(){
        touchEvents.forEach(function(type){
            compsRegistry[type] = {};
            siteAspectAPI.registerToWindowTouchEvent(type, propagateTouchEvent);
        }, this);
    }

    /**
     * calls appropriate method in a listener
     *
     * @param {TouchEvent} e - native TouchEvent object
     * @private
     */
    function propagateTouchEvent(e){
        var touchType = e.type.slice('touch'.length);
        var eventType = 'WindowTouch' + stringUtils.capitalize(touchType);
        var registeredComps = compsRegistry[e.type];
        var methodName = 'on' + eventType;
        var listener;

        _.forEach(registeredComps, function(compId){
            listener = siteAspectAPI.getComponentById(compId);

            if (!listener){
                delete registeredComps[compId];
            } else if (listener[methodName]){
                listener[methodName](e);
            }
        }, this);
    }

    WindowTouchEventsAspect.prototype = {

        /**
         * registers to the touch event
         *
         * @param {string} type - event type
         * @param {ReactComponent} comp - component to bind to the event
         */
        registerToWindowTouchEvent: function(type, comp){
            compsRegistry[type.toLowerCase()][comp.props.id] = comp.props.id;
        },

        /**
         * unregisters from the touch event
         *
         * @param {string} type - event type
         * @param {ReactComponent} comp - component to unbind from the event
         */
        unregisterFromWindowTouchEvent: function(type, comp){
            delete compsRegistry[type.toLowerCase()][comp.props.id];
        }
    };

    siteAspectsRegistry.registerSiteAspect('windowTouchEvents', WindowTouchEventsAspect);
});