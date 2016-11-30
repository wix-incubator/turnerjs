define.component('wysiwyg.editor.components.MobileActionsMenuRevisedAlert', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.resources(['W.Commands', 'W.Config']);

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.binds(['_setVisibilityAccordingToState']);

    def.dataTypes('QuickActions');

    def.statics({
        TEXTS: {
            prefix: "MOBILE_ACTIONS_MENU_EDITOR_ALERT_TEXT_PRE",
            postfix: "MOBILE_ACTIONS_MENU_EDITOR_ALERT_TEXT_POST",
            link: "MOBILE_ACTIONS_MENU_EDITOR_ALERT_TEXT_LINK"
        }
    });

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.SetViewerMode", this, this._setVisibilityAccordingToState);
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.WSetEditMode", this, this._setVisibilityAccordingToState);

            this._setVisibilityAccordingToState() ;
        },

        _setVisibilityAccordingToState: function() {
            var shouldShow = !this.resources.W.Config.env.isEditorInPreviewMode() &&
                this.resources.W.Config.env.isViewingSecondaryDevice() ;
            if(shouldShow) {
                this.$view.uncollapse() ;
            } else {
                this.$view.collapse() ;
            }
        },

        _createFields: function(){
            this.setNumberOfItemsPerLine(0);
            this.addIcon("mobile/activate_msg_icon2.png", null, {width:"35px", height:"37px"});
            this.addInlineTextLinkField(
                null,
                this._translate(this.TEXTS.prefix),
                this._translate(this.TEXTS.link),
                this._translate(this.TEXTS.postfix),
                null, null, null, null, null,
                {"width": "240px"}
            )
            .addEvent("click", function(event){
                W.Commands.executeCommand("WEditorCommands.MobileSettings");
                W.Commands.executeCommand("WEditorCommands.ShowMobileQuickActionsView", {"src": "tooltip"});
            });

//            this._data.addEvent(Constants.DataEvents.DATA_CHANGED, this._updateTextOnDataChange);
        }
    });
});
