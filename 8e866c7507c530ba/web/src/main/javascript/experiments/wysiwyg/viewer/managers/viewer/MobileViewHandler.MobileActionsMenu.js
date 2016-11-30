/**@class wysiwyg.common.managers.viewer.MobileViewHandler */
define.experiment.Class('wysiwyg.common.managers.viewer.MobileViewHandler.MobileActionsMenu', function(classDefinition, experimentStrategy){
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.utilize([
        'wysiwyg.viewer.utils.MobileQuickActionsHandler',
        'wysiwyg.viewer.utils.MobileActionsMenuHandler'
    ]);

    /** @lends wysiwyg.common.managers.viewer.MobileViewHandler */
    def.methods({

        handleQuickActions:function(){
            var menuHandler;
            if(window.WMobileActionsMenu && window.WMobileActionsMenu.isInited()) {
                menuHandler = new this.imports.MobileActionsMenuHandler();
                menuHandler.handleMobileActionsMenu();
            } else {
                menuHandler = new this.imports.MobileQuickActionsHandler();
                menuHandler.handleMobileQuickActions();
            }

        },

        addRotationEventListener:function(){
            window.addEventListener("orientationchange", this._handleMobileRotation, false);
            if (window.WQuickActions || window.WMobileActionsMenu) {
                window.addEventListener("orientationchange", this._showQuickActions, false);
            }
        },

        removeRotationEventListener:function(){
            window.removeEventListener("orientationchange", this._handleMobileRotation);
            if (window.WQuickActions || window.WMobileActionsMenu) {
                window.removeEventListener("orientationchange", this._showQuickActions);
            }
        },

        _fixQuickActionsZoom: function(){
            if(!(window.WQuickActions || window.WMobileActionsMenu)){
                return;
            }
            W.Viewer.addEvent('SiteReady', function(){
                _.delay(this._showQuickActions, 100);
            }.bind(this));
        },

        _hideQuickActions: function(){
            if(window.WMobileActionsMenu){
                window.WMobileActionsMenu.forceCloseActionsMenu();
            } else if(window.WQuickActions){
                window.WQuickActions.hideBar();
            }
        },

        _showQuickActions:function(){
            setTimeout(function () {
                if(window.WMobileActionsMenu){
//                    window.WMobileActionsMenu.updateDisplay(100);
                } else if(window.WQuickActions){
                    window.WQuickActions.showBar();
                    window.WQuickActions.fixZoom();
                }
            }, 100);
        }
    });
});