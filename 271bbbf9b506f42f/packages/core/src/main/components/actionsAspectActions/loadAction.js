define([
    'lodash',
    'utils',
    'core/components/actionsAspectActions/baseAction',
    'core/components/actionsAspectActions/triggerTypesConsts'
], function(
    _,
    utils,
    baseAction,
    triggerTypes
) {
    "use strict";

    /**
     * Constructor for ScreenIn action, starts disabled.
     * @param aspectSiteAPI
     * @constructor
     */
    function LoadAction() {
        baseAction.apply(this, arguments);
    }

    function getSiteStructureActions(currentActions) {
        return _.pick(currentActions, function (action) {
            return action.sourceId === utils.siteConstants.SITE_STRUCTURE_ID;
        });
    }

    LoadAction.prototype = _.create(baseAction.prototype, {
        constructor: LoadAction,

        ACTION_TRIGGERS: [
            triggerTypes.SITE_READY,
            triggerTypes.PAGE_RELOADED,
            triggerTypes.PAGE_CHANGED,
            triggerTypes.DID_LAYOUT,
            triggerTypes.ACTIONS_REMOVED,
            triggerTypes.ACTIONS_ADDED_LAYOUTED
        ],

        ACTION_NAME: 'load',
        ACTIONS_SUPPORTED: ['load'],

        shouldEnable: _.constant(true),

        runAction: function() {
            var actionIdsToTrigger = _(this._currentActions)
                .omit(_.keys(this._triggeredOnce))
                .keys()
                .value();

            this.triggerActions(actionIdsToTrigger);
        },

        /**
         * Handle triggers passed from actionsAspect
         * @param {ActionsTriggerTypes} triggerType
         */
        handleActionTrigger: function (triggerType) {
            switch (triggerType) {
                case triggerTypes.ACTIONS_REMOVED:
                    this._triggeredOnce = _(this._triggeredOnce)
                        .omit(_.keys(arguments[1]))
                        .omit(_.keys(getSiteStructureActions(this._currentActions)))
                        .value();
                    break;
                case triggerTypes.SITE_READY:
                case triggerTypes.PAGE_RELOADED:
                case triggerTypes.PAGE_CHANGED:
                case triggerTypes.DID_LAYOUT:
                    this.executeOnNextTick(this.runAction);
            }
        },

        resetActionState: _.noop
    });

    /**
     * @exports LoadAction
     */
    return LoadAction;
});
