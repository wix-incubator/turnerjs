define.experiment.Class('wysiwyg.editor.managers.editormanager.WEditorManager.FirstTimeHideHeaderFooterPopup', function (def, strategy) {

    def.methods({
        _registerCommands: strategy.after(function (){
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.LandingPageChecked", this, this._showLandingPagesDialogIfFirstTime);
        }),
        _showLandingPagesDialogIfFirstTime: function(commandParam){
            if(commandParam.toLanding){
                var icon = {x: 0, y: 0, width: 175, height: 153, url: 'icons/landing-animation.gif'};
                var landingPagesKey = 'LandingPages';
                this.userPreferencesHandler.getGlobalData(landingPagesKey).then(function(landingPagesData){
                    if(!landingPagesData.firstTimePopup){
                        landingPagesData.firstTimePopup = true;
                        this.userPreferencesHandler.setGlobalData(landingPagesKey, landingPagesData, {saveNow: true});
                        this.resources.W.EditorDialogs.openNotificationDialog("Landing_Pages_First_Time", "LANDING_PAGES_POPUP_TITLE", "LANDING_PAGES_POPUP_TEXT1", 566, 90, icon);
                    }
                }.bind(this));
            }
        }
    });
});