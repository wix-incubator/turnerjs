define([
    'lodash',
    'utils',
    'core/components/actionsAspectActions/baseAction',
    'core/components/actionsAspectActions/triggerTypesConsts'
], function(_, utils, baseAction, triggerTypes) {
    "use strict";

    var DELAY_ADJUSTMENT = 0.2;
    var DEFAULT_THRESHOLD = 15 / 100; // 15%

    /**
     * Constructor for ScreenIn action, starts disabled.
     * @param aspectSiteAPI
     * @constructor
     */
    function ScreenInAction() {
        baseAction.apply(this, arguments);
        this._currentScroll = {x:0, y:0};
        this._currentPopupScroll = {x:0, y:0};
    }

    ScreenInAction.prototype = _.create(baseAction.prototype, {
        constructor: ScreenInAction,
        ACTION_TRIGGERS: [triggerTypes.SCROLL, triggerTypes.RESIZE, triggerTypes.ACTIONS_ADDED_LAYOUTED, triggerTypes.ACTIONS_REMOVED, triggerTypes.DID_LAYOUT],
        ACTION_NAME: 'screenIn',
        ACTIONS_SUPPORTED: ['screenIn'],

        /**
         *
         * @param {SiteAspectsSiteAPI} siteAPI
         * @param {String} parentId
         * @returns {ReactCompositeComponent}
         */
        getComponentParent: function (parentId) {
            return this._aspectSiteAPI.getPageById(parentId);
        },

        /**
         * Test if a component is in the viewport
         * "In viewport" mans that either the top position of the component is in screen bounds,
         * or bottom of component is in screen bounds
         * or bottom is under the screen and top is above the screen, meaning the component "wraps" the viewport
         * @param action
         * @returns {boolean}
         */
        isComponentInViewport: function (action) {
            var currScroll = this._aspectSiteAPI.getCurrentPopupId() === action.pageId ?
                this._currentPopupScroll :
                this._currentScroll;

            return utils.viewportUtils.isAlwaysInViewport(this._aspectSiteAPI, action.sourceId) ||
                utils.viewportUtils.isInViewport(this._aspectSiteAPI, currScroll, action.sourceId, DEFAULT_THRESHOLD) ||
                this.isChildOfFixedFooter(action.pageId, action.sourceId);
        },

        /**
         * find if component is a child of footer
         * @param {SiteAspectsSiteAPI} siteAPI
         * @param {string} pageId
         * @param {string} id
         * @returns {boolean}
         */
        isChildOfFixedFooter: function (pageId, id) {
            var isFixed = false;

            var footerCustomMeasure = this._aspectSiteAPI.getSiteData().measureMap.custom.SITE_FOOTER;
            if (pageId === 'masterPage' && footerCustomMeasure && footerCustomMeasure.isFixedPosition) {
                var footer = this._aspectSiteAPI.getMasterPage().refs.SITE_FOOTER;
                    isFixed = this.isDescendantOf(footer.props.structure, id);
            }

            return isFixed;
        },

        /**
         * Run recursively over a component structure and return true if a component with the given id is a descendent of it.
         * Note: this will not work for pages_container and down into the page
         * @param {object} compStructure
         * @param {string} id
         * @returns {boolean}
         */
        isDescendantOf: function (compStructure, id) {
            if (!compStructure.components) {
                return false;
            }

            return _.some(compStructure.components, function (child) {
                if (child.id === id) {
                    return true;
                }
                return this.isDescendantOf(child, id);
            }, this);
        },

        runAction: function() {
            var actionIdsToTrigger = _(this._currentActions)
                .omit(_.keys(this._triggeredOnce))
                .pick(this.isComponentInViewport)
                .keys()
                .value();
            this.triggerActions(actionIdsToTrigger);
        },

        /**
         * Handle triggers passed from actionsAspect
         * @param {ActionsTriggerTypes} triggerType
         */
        handleActionTrigger: function (triggerType) {
            this._currentScroll = this._aspectSiteAPI.getSiteScroll();
            this._currentPopupScroll = this._aspectSiteAPI.getCurrentPopupScroll();

            switch (triggerType) {
                case triggerTypes.ACTIONS_REMOVED:
                    this._triggeredOnce = _.omit(this._triggeredOnce, _.keys(_.toArray(arguments)[1]));
                    break;
                case triggerTypes.DID_LAYOUT:
                case triggerTypes.SCROLL:
                case triggerTypes.RESIZE:
                case triggerTypes.ACTIONS_ADDED_LAYOUTED:
                case triggerTypes.PAGE_CHANGED:
                    var delay = Math.max((this._delayActionByTransitionDuration) - DELAY_ADJUSTMENT, 0) * 1000;
                    if (delay > 0) {
                        _.delay(function () {
                            // A quick and dirty hack no. 2 to sequence between page transition and screen in
                            this._delayActionByTransitionDuration = 0;
                            this.executeOnNextTick(this.runAction);
                        }.bind(this), delay);
                    } else {
                        this.executeOnNextTick(this.runAction);
                    }
                    break;
            }
        },

        shouldEnable: function () {
            var isBrowser = typeof window !== 'undefined';

            return isBrowser;
        },

        resetActionState: _.noop
    });

    /**
     * @exports ScreenInAction
     */
    return ScreenInAction;
});
