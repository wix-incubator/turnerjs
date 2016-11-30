define.experiment.Class('wysiwyg.editor.commandregistrars.OpenPanelCommandRegistrar.ExitMobileModeEditorToggle', function (classDefinition, experimentStrategy) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        registerCommands: strategy.after(
            function(){
                var cmdmgr = this.resources.W.Commands;
                this._mobileExitMobileModeDesignPanelCommand = cmdmgr.registerCommandAndListener("WEditorCommands.ShowExitMobileModeDesignPanel", this, this._showExitMobileModeDesignPanel);

            }
        ),

        _showExitMobileModeDesignPanel:function(componentOptional){
            var comp;
            if(componentOptional){
                comp = componentOptional.selectedComp || componentOptional;
            } else {
                comp = W.Editor.getEditedComponent();
            }
            if(!comp || (comp && comp.$className != "wysiwyg.common.components.exitmobilemode.viewer.ExitMobileMode")){
                comp = W.Preview.getCompLogicById('mobile_EXIT_MENU');
                if(!comp){
                    W.EditorDialogs.openPromptDialog(W.Resources.get('EDITOR_LANGUAGE', 'Uh_oh'),
                        W.Resources.get('EDITOR_LANGUAGE', 'MOBILE_CANT_DESIGN_EXIT_MOBILE'), undefined, W.EditorDialogs.DialogButtonSet.OK);
                    return;
                }
            }
            W.Editor.setSelectedComp(comp);
            this._showStyleSelectorPanel({
                editedComponent:comp,
                description:W.Resources.get('EDITOR_LANGUAGE', "ExitMobileMode_CHANGE_STYLE_DESC")
            });
        }


    });
});
