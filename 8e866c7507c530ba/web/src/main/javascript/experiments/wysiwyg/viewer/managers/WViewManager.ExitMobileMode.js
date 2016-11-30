define.experiment.Class('wysiwyg.viewer.managers.WViewManager.ExitMobileMode', function(classDefinition, experimentStrategy){
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        initiateSite: function(forceViewerById) {
            // EXPERIMENT MOD: added arg forceViewerById to force a specific view mode
            var self = this;
            var initiateSiteView = function(isMobileStructureExist){
                var isImposingDesktopMode = self._isDesktopModeImposed();
                var loadMobileStructure = !isImposingDesktopMode && isMobileStructureExist && (W.Config.isMobileOptimizedViewOn() || W.Config.forceMobileOptimizedViewOn());
                var viewerName = loadMobileStructure ? Constants.ViewerTypesParams.TYPES.MOBILE : Constants.ViewerTypesParams.TYPES.DESKTOP;
                self._firstActiveViewerLoad(viewerName);
                if(W.Config.mobileConfig.isMobile() || forceViewerById===Constants.ViewerTypesParams.TYPES.DESKTOP){
                    //done for all mobile devices.
                    self._mobileHandler.setMobileSite(viewerName);
                }
                self._activeViewer_.initiateSite();
                if(isImposingDesktopMode) {
                    MobileUtils.setViewportContent("");
                    MobileUtils.fixViewportScale();
                    self._removePreloader();
                }
            };

            if(forceViewerById !== Constants.ViewerTypesParams.TYPES.DESKTOP && W.Config.env.$isPublicViewerFrame && (W.Config.mobileConfig.isMobile() || W.Config.forceMobileOptimizedViewOn())) {
                this._dataResolver.isStructureExists(Constants.ViewerTypesParams.TYPES.MOBILE).then(initiateSiteView);
            } else {
                initiateSiteView(false);
            }
        },

        _isDesktopModeImposed: function() {
            if(this._desktopSiteImposing) {
                return true;
            }

            var cookie = W.CookiesManager.getCookie("desktopSiteImposing");
            if(cookie) {
                this._desktopSiteImposing = true;
                W.CookiesManager.removeCookie("desktopSiteImposing");
                return true;
            }
            return false;
        },

        _removePreloader: function () {
            var preloader = document.getElementById("viewer_preloader");
            if (preloader) {
                document.body.removeChild(preloader);
            }

            var fixedPreloader = document.getElementById(Constants.ViewerTypesParams.DOM_ID_STATIC_PREFIX + "viewer_preloader");
            if (fixedPreloader) {
                document.body.removeChild(fixedPreloader);
            }
        }
    });

});
