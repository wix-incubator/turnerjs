define([
    'lodash',
    'utils',
    'core/components/behaviorHandlers/prefetchPagesBehaviorHandler'
], function (
    _,
    utils,
    prefetchPagesBehaviorHandler
) {
    'use strict';

    function createPopupsHandler() {
        function isInEditorMode(siteData) {
            return siteData.renderFlags.componentViewMode === 'editor';
        }

        function hasBeenPopupOpened(siteAPI, popupId) {
            var runtimeDal = siteAPI.getRuntimeDal();
            return runtimeDal.hasBeenPopupOpened(popupId);
        }

        function shouldShowPopup(siteAPI, siteData, behavior) {
            var popupId = behavior.targetId;

            if (siteAPI.isZoomOpened()) {
                return false;
            }

            if (isInEditorMode(siteData)) {
                return false;
            }

            if (hasBeenPopupOpened(siteAPI, popupId) || siteAPI.isPopupOpened()) {
                return false;
            }

            if (siteData.isMobileView()) {
                return Boolean(behavior.params.openInMobile);
            }

            return Boolean(behavior.params.openInDesktop);
        }

        function getDelayInMs(behavior) {
            return 1000 * (behavior.params.delay || 0);
        }

        var delayedCall;

        return function openPopup(behavior, siteAPI) {
            clearTimeout(delayedCall);

            var siteData = siteAPI.getSiteData();

            if (!shouldShowPopup(siteAPI, siteData, behavior)) {
                return;
            }

            delayedCall = setTimeout(function openPopupCallback(primaryPageId) {
                // TODO: I'm sorry. Can we check if we can remove side effects in editor navigation itself (so it does not call at all the .navigateTo() in viewer)?
                var hasPageUnexpectedlyChanged = siteData.getPrimaryPageId() !== primaryPageId;

                if (hasPageUnexpectedlyChanged) {
                    return;
                }

                if (shouldShowPopup(siteAPI, siteData, behavior)) {
                    siteAPI.openPopupPage(behavior.targetId);
                }
            }, getDelayInMs(behavior), siteData.getPrimaryPageId());
        };
    }

    function isEnabled() {
        return true;
    }

    function init() {
        return {
            default: function missingBehavior(behavior) {
                utils.log.error('Invalid behavior', behavior);
            },
            openPopup: createPopupsHandler(),
            prefetchPages: prefetchPagesBehaviorHandler.prefetchPages
        };
    }

    function initIsEnabledFunctions() {
        return {
            default: function missingBehavior(behavior) {
                utils.log.error('Invalid behavior', behavior);
            },
            openPopup: isEnabled,
            prefetchPages: prefetchPagesBehaviorHandler.isEnabled
        };
    }

    var siteBehaviors;
    var isEnabledFunctions;

    return {
        handle: function handle(behaviors, siteAPI) {
            siteBehaviors = siteBehaviors || init();
            _.forEach(behaviors, function (behavior) {
                var behaviorFunc = siteBehaviors[behavior.name] || siteBehaviors.default;
                behaviorFunc(behavior, siteAPI);
            });
        },
        isEnabled: function (behavior, siteAPI) {
            isEnabledFunctions = isEnabledFunctions || initIsEnabledFunctions();

            var isEnableFunc = isEnabledFunctions[behavior.name] || isEnabledFunctions.default;
            return isEnableFunc(siteAPI);
        }
    };
});
