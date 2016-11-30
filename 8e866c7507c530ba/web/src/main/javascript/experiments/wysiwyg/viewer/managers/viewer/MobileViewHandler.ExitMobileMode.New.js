/**@class wysiwyg.common.managers.viewer.MobileViewHandler */
define.experiment.Class('wysiwyg.common.managers.viewer.MobileViewHandler.ExitMobileMode.New', function(classDefinition, strategy){
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    /** @lends wysiwyg.common.managers.viewer.MobileViewHandler */
    def.methods({
        _resetViewPortTagAttributes: function(){
            if(W.Config.isMobileOptimizedViewOn()) {
                var docWidth = W.Viewer.getDocWidth();
                this.setViewportAttribute("width", docWidth);
                this.setViewportAttribute("initial-scale", 1);
                this.setViewportAttribute("user-scalable", "yes");
            } else {
                this.setViewportAttribute("width", "");
                this.setViewportAttribute("initial-scale", "");
                this.setViewportAttribute("user-scalable", "yes");
            }
            this.setViewportAttribute("maximum-scale", 1.25);
            this.setViewportAttribute("minimum-scale", 0.25);
        },

        handleQuickActions:function(){
            if(this._mobileQuickActionsHandler) {
                return;
            }
            this._mobileQuickActionsHandler = new this.imports.MobileQuickActionsHandler();
            this._mobileQuickActionsHandler.handleMobileQuickActions();
        }
    });
});