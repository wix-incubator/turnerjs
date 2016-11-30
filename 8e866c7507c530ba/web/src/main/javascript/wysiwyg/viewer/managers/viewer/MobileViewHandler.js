/**@class wysiwyg.common.managers.viewer.MobileViewHandler */
define.Class('wysiwyg.common.managers.viewer.MobileViewHandler', function(classDefinition){
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.utilize([
        'wysiwyg.viewer.utils.MobileQuickActionsHandler'
    ]);

    def.binds(['_handleMobileRotation']);

    def.resources(['W.Config']);

    /** @lends wysiwyg.common.managers.viewer.MobileViewHandler */
    def.methods({
        //only in public
        setMobileSite:function(viewerName){
            this._viewerName = viewerName;
            this.handleQuickActions();
            if (this._viewerName === Constants.ViewerTypesParams.TYPES.MOBILE){
                if (W.Config.isLoadedFromStatic()){
                    //this was added due to flickering upon static loading
                    this._handleMobileRotation();
                    this.addRotationEventListener();
                } else {
                    this._hideQuickActions();
                    this._handleMobileRotation();
                    this._fixQuickActionsZoom();
                    this.addRotationEventListener();
                }
            } else{
                this._resetViewPortTagAttributes();
            }
        },

        addRotationEventListener:function(){
            window.addEventListener("orientationchange", this._handleMobileRotation, false);
            if (window.WQuickActions) {
                window.addEventListener("orientationchange", this._showQuickActions, false);
            }
        },

        removeRotationEventListener:function(){
            window.removeEventListener("orientationchange", this._handleMobileRotation);
            if (window.WQuickActions) {
                window.removeEventListener("orientationchange", this._showQuickActions);
            }
        },

        _handleMobileRotation:function(){
            if(!W.Config.env.$isPublicViewerFrame){
                LOG.reportError(wixErrors.NO_MOBILE_IN_EDITOR, this.className, '_handleMobileRotation');
                return;
            }
            if (!window.MobileUtils){
                return;
            }
            MobileUtils.fixViewportScale(Constants.ViewerTypesParams.DOC_WIDTH.MOBILE);
        },

        // we use falseWidth because on some devices (iOS) we have to provide different width to apply viewport
        setViewportTag:function(width, viewportScale){
            if(!W.Config.env.$isPublicViewerFrame){
                LOG.reportError(wixErrors.NO_MOBILE_IN_EDITOR, this.className, 'setViewportTag');
                return;
            }
            if (!window.MobileUtils){
                return;
            }
            MobileUtils.setViewportTag(width, viewportScale);
        },

        _fixQuickActionsZoom: function(){
            if(!window.WQuickActions){
                return;
            }
            W.Viewer.addEvent('SiteReady', function(){
                _.delay(this._showQuickActions, 100);
            }.bind(this));
        },

        _hideQuickActions: function(){
            if(!window.WQuickActions){
                return;
            }
            window.WQuickActions.hideBar();
        },

        _showQuickActions:function(){
            setTimeout(function () {
                if(!window.WQuickActions){
                    return;
                }
                window.WQuickActions.showBar();
                window.WQuickActions.fixZoom();
            }, 100);
        },

        _resetViewPortTagAttributes: function(){
            this.setViewportAttribute('minimum-scale', '0.25');
            this.setViewportAttribute('maximum-scale', '1.2');
        },

        handleQuickActions:function(){
            var mobileQuickActionsHandler = new this.imports.MobileQuickActionsHandler();
            mobileQuickActionsHandler.handleMobileQuickActions();
        },

        /**
         *
         * @param attribute
         * @param value
         * @private
         */
        setViewportAttribute: function (attribute, value) {
            var viewPort = document.getElementById('wixMobileViewport');
            if (!viewPort) {
                return;
            }
            var contentAttribute = viewPort.getAttribute('content');
            var contentAttributeKeyValPairs = contentAttribute.split(/ *,/);
            var newContent = '';
            var foundAttribute = false;
            for (var i = 0; i < contentAttributeKeyValPairs.length; i++) {
                var keyValPair = contentAttributeKeyValPairs[i];
                if (keyValPair.indexOf(attribute) > -1) {
                    foundAttribute = true;
                    if (!value) { // remove the key
                        continue;
                    }
                    keyValPair = keyValPair.replace(/\ *=.*/, '=' + value);
                }
                newContent += keyValPair + ",";
            }
            newContent = newContent.substring(0, newContent.length - 1);

            if (foundAttribute || !value) {
                viewPort.setAttribute('content', newContent);
            } else {
                viewPort.setAttribute('content', newContent + ',' + attribute + '=' + value);
            }
        }
    });
});