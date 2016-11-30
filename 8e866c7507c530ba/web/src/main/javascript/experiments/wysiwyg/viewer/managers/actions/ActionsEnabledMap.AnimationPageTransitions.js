resource.getResourceValue('W.Experiments', function (experimentsManager) {
    if (experimentsManager.isExperimentOpen("AnimationPageTransitions")) {
        resource.getResources(['W.Config','W.Utils'], function (resources) {
            var config = resources.W.Config;
            var utils = resources.W.Utils;

            var isIe8 = typeof window.addEventListener === 'undefined';
            var isDeviceMobile = config.mobileConfig.isMobileOrTablet();

//            var isEditorFrame = config.env.$isEditorFrame;
//            var isPublicViewer = config.env.$isPublicViewerFrame;
//            var isPreviewFrame = config.env.$isEditorViewerFrame;

            var disabledActions = utils.getQueryParam('disableActions');
                disabledActions = (!disabledActions) ? [] : disabledActions.split(',');

            var map = {};
            map[Constants.Actions.PAGE_IN] = !_.contains(disabledActions, Constants.Actions.PAGE_IN) && !isIe8 && !isDeviceMobile;
            map[Constants.Actions.SCREEN_IN] = !_.contains(disabledActions, Constants.Actions.SCREEN_IN) && !isIe8 && !isDeviceMobile;
            map[Constants.Actions.PAGE_TRANSITION] = !_.contains(disabledActions, Constants.Actions.PAGE_TRANSITION) && !isIe8;

            define.resource('ActionsEnabledMap', map);
        });
    }
});