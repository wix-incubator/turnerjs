define.component('wysiwyg.editor.components.dialogs.MobilePropertySplit', function (componentDefinition) {
    //@type core.managers.component.ComponentDefinition
    var def = componentDefinition;
    def.inherits('wysiwyg.editor.components.dialogs.NotificationDialog');

    def.binds(['_onBeforeClose']);

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._dialogName = args.dialogName;
            this._dialogWindow = args.dialogWindow;
            this._setShowAgainStatusCallBack = args.setShowAgainStatusCallBack;
            this._notificationWidth = args.width;
            this._icon = args.icon;
            this._description = args.description;
            this._dialogWindow.addEvent('onDialogClosing', this._onBeforeClose);
            this._changeCB = args.onChange;
            this._approveLabel = args.approveLabel || 'OK';
        },

        _onBeforeClose: function(e){
            var isApproved = e && e.result == this._approveLabel;
            this._changeCB(isApproved);
        },

        _createDescription:function(container){
            if(this._description){
                container.addInlineTextLinkField(W.Resources.get('EDITOR_LANGUAGE', this._description));
                if(this._helpletID){
                    container.addBreakLine('10px');
                    container.addInlineTextLinkField(null, null, W.Resources.get('EDITOR_LANGUAGE', "HELPLET_LEARN_MORE"))
                        .addEvent(Constants.CoreEvents.CLICK, this._showHelp);
                }
            }
        }
    });
});








