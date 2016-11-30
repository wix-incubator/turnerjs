define.experiment.component('wysiwyg.editor.components.panels.FloatingPropertyPanel.BlinkyFormContainer', function (def, strategy) {
    def.methods({
        _setPanelButtonsVisibility: function (mode, componentCommands) {
            // Reset to default commands
            this._skinParts.hide.setCommand("WEditorCommands.WHideSelectedComponent");
            this._skinParts.remove.setCommand("WEditorCommands.WDeleteSelectedComponent");

            switch (mode) {
                case Constants.ViewerTypesParams.TYPES.MOBILE:
                    this._skinParts.copy.collapse();
                    this._skinParts.paste.collapse();
                    if (componentCommands && componentCommands.mobile && componentCommands.mobile.forceRemoveIconOnHide === true) {
                            this._skinParts.remove.setCommand("WEditorCommands.WHideSelectedComponent");
                        this._skinParts.remove.uncollapse();
                        this._skinParts.hide.collapse();
                    } else {
                        this._skinParts.remove.collapse();
                        this._skinParts.hide.uncollapse();
                    }
                    break;
//                case Constants.ViewerTypesParams.TYPES.DESKTOP:
                default:
                    this._skinParts.copy.uncollapse();
                    this._skinParts.paste.uncollapse();
                    if (componentCommands && componentCommands.general && componentCommands.general.forceHideIconOnRemove === true) {
                        this._skinParts.remove.collapse();
                        this._skinParts.hide.setCommand("WEditorCommands.WDeleteSelectedComponent");
                        this._skinParts.hide.uncollapse();
                    } else {
                        this._skinParts.remove.uncollapse();
                        this._skinParts.hide.collapse();
                    }
                    break;

            }

            this._skinParts.textLarger.setCollapsed(!this._enableTextSacleButtons);
            this._skinParts.textSmaller.setCollapsed(!this._enableTextSacleButtons);

        }
    });

});
