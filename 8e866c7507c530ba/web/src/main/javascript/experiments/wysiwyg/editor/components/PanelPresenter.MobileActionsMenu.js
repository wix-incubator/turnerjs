define.experiment.component('wysiwyg.editor.components.PanelPresenter.MobileActionsMenu', function(componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;
    var strategy = experimentStrategy;

    def.skinParts(strategy.merge({
        mobileActionsMenuRevisedAlert: { type: 'wysiwyg.editor.components.MobileActionsMenuRevisedAlert', autoCreate: false, dataQuery: "#QUICK_ACTIONS" }
    }));

    def.methods({
        _createMobileAlerts: function(){
            this._createMobileActionsMenuRevisedAlert();
        },

        _createMobileActionsMenuRevisedAlert: function(){
            if (!this._skinParts.mobileActionsMenuRevisedAlert){
                var el = this._createInnerComponent(this.getSkinPartDefinition('mobileActionsMenuRevisedAlert'));
                el.$view.insertInto(this._skinParts.mobileActivationAlertContainer);
                this._skinParts.mobileActionsMenuRevisedAlert = el;
            }
        }
    });
});
