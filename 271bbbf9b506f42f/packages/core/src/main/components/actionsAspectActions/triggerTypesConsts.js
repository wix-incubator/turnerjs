define([], function(){
    "use strict";
    /**
     * @typedef {object} ActionsTriggerTypes
     * @type {ActionsTriggerTypes}
     **/
    return {
        DID_LAYOUT: 'didLayout',
        SCROLL: 'scroll',
        RESIZE: 'resize',
        PAGE_CHANGED: 'pageChanged',
        PAGE_RELOADED: 'pageReloaded',
        SITE_READY: 'siteReady',
        TRANSITION_ENDED: 'transitionEnded',
        MODE_CHANGED_INIT: 'modeChangedInit',
        MODE_CHANGED_EXECUTE: 'modeChangedExecute',
        ACTIONS_ADDED_LAYOUTED: 'actionsAddedLayouted',
        ACTIONS_REMOVED: 'actionsRemoved'
    };
});
