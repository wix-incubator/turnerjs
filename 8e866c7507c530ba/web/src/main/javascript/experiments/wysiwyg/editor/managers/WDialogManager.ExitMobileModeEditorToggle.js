define.experiment.Class('wysiwyg.editor.managers.WDialogManager.ExitMobileModeEditorToggle', function(classDefinition, experimentStrategy){
    /**@type  bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;
    var strategy = experimentStrategy;

    def.methods({
        openExitMobileModeDialog: function(){
            this._createAndOpenWDialog(
                '_exitMobileModePanel',
                'wysiwyg.editor.components.panels.ExitMobileModePanel',
                'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                function(innerLogic){},
                {
                    width       : 265,
                    position    : Constants.DialogWindow.POSITIONS.SIDE,
                    level       : 1,
                    semiModal   : true,
                    allowDrag   : true,
                    buttonSet   : this.DialogButtonSet.DONE,
                    title       : W.Resources.get("EDITOR_LANGUAGE", "MOBILE_EXIT_MOBILE_BUTTON_PANEL_TITLE")
                },
                null, true, {}, false, false, true);
        }
    });
});
