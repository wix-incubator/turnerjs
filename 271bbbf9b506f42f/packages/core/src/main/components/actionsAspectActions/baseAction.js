define([
    'lodash',
    'animations',
    'core/components/actionsAspectActions/triggerTypesConsts'
], function(_, animations, triggerTypes) {
    "use strict";

    /**
     * Constructor for ScreenIn action, starts disabled.
     * @param aspectSiteAPI
     * @constructor
     */
    function BaseAction(aspectSiteAPI) {
        this._aspectSiteAPI = aspectSiteAPI;
        this._siteData = aspectSiteAPI.getSiteData();
        this._isEnabled = false;
        this._triggeredOnce = {};
        _.bindAll(this);
    }

    BaseAction.prototype = _.create(Object.prototype, {
        constructor: BaseAction,
        ACTION_TRIGGERS: [],
        ACTION_NAME: 'BASE_ACTION',
        ACTIONS_SUPPORTED: ['BASE_ACTION'],

        /**
         * If this returns false, we shouldn't enable this action.
         * @returns {boolean}
         */
        shouldEnable: function () {
            var isBrowser = typeof window !== 'undefined';
            var isTablet = this._siteData.isTabletDevice();
            var isMobile = this._siteData.isMobileDevice();
            var isMobileView = this._siteData.isMobileView();

            return isBrowser && !isTablet && !isMobile && !isMobileView;
        },

        enableAction: function () {
            if (this._isEnabled) {
                return;
            }
            this._triggeredOnce = {};
            this._currentActions = {};
            this._delayActionByTransitionDuration = 0;
            this._executeOnNextTick = [];
            this.resetActionState();
            this._tickerCallback = this._executeActionOnTick.bind(this);
            animations.addTickerEvent(this._tickerCallback);
            this._isEnabled = true;
        },

        disableAction: function () {
            if (!this._isEnabled) {
                return;
            }

            this._executeOnNextTick = [];
            animations.removeTickerEvent(this._tickerCallback);
            this._tickerCallback = null;
            this._isEnabled = false;
            this._delayActionByTransitionDuration = 0;
            this.resetActionState();
        },
        
        isEnabled: function() {
            return this._isEnabled;    
        },

        triggerActions: function(actionIds, event) {
            var behaviorsAspect = this._aspectSiteAPI.getSiteAspect('behaviorsAspect');
            _.forEach(actionIds, function(actionId) {
                this._triggeredOnce[actionId] = true;
            }, this);
            event = _.defaults(event || {}, {action: this.ACTION_NAME});
            return behaviorsAspect.handleActions(_(this._currentActions).pick(actionIds).values().value(), event);
        },

        /**
         * This is a quick and dirty way to sync between page transitions and screen in.
         * @param {number} duration the duration of the next page transition
         */
        registerPageTransitionDuration: function (duration) {
            this._delayActionByTransitionDuration = duration;
        },

        /**
         * remove when refactor is complete
         */
        handleBehaviorsUpdate: _.noop,
        executeAction: _.noop,

        /**
         * Execute the action only if it is scheduled to run on next tick
         * @private
         */
        _executeActionOnTick: function () {
            if (_.isEmpty(this._executeOnNextTick)) {
                return;
            }
            var callbacks = this._executeOnNextTick;
            this._executeOnNextTick = [];
            _.forEach(callbacks, function (callback) {
                callback();
            });
        },

        executeOnNextTick: function (callback) {
            this._executeOnNextTick = _(this._executeActionOnTick)
                .concat([callback])
                .uniq()
                .value();
        },

        handleTrigger: function(triggerAction) {
            var args = _.toArray(arguments);
            switch (triggerAction) {
                    case triggerTypes.ACTIONS_ADDED_LAYOUTED:
                        args[1] = _.pick(args[1], function (action) {
                            return _.includes(this.ACTIONS_SUPPORTED, action.name);
                        }, this);
                        _.assign(this._currentActions, args[1]);
                        break;
                    case triggerTypes.ACTIONS_REMOVED:
                        args[1] = _.pick(args[1], function (action) {
                            return _.includes(this.ACTIONS_SUPPORTED, action.name);
                        }, this);
                        this._currentActions = _.omit(this._currentActions, _.keys(args[1]));
                        break;
            }

            if (this._isEnabled) {
                this.handleActionTrigger.apply(this, args);
            }
        },

        handleActionTrigger: function () {
            throw "Need to implement handleTrigger in specific actions";
        },

        resetActionState: function() {
            throw "Need to implement resetActionState in specific actions";
        }

    });

    /**
     * @exports BaseAction
     */
    return BaseAction;
});
