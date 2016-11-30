define.experiment.Class('wysiwyg.editor.managers.WDialogManager.RedirectFeature301', function(classDefinition, experimentStrategy){
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;
    /**@type bootstrap.managers.experiments.ExperimentStrategy */
    var strategy = experimentStrategy;

    def.methods({

        openAdvancedSeoSettings:function() {
            this._createAndOpenWDialog(
                '_AdvancedSeoSettingsDialog',
                'wysiwyg.editor.components.dialogs.AdvancedSeoSettingsDialog',
                'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                function () {},
                {
                    width:620,
                    height:484,
                    allowScroll:false,
                    allowDrag:false,
                    position:Constants.DialogWindow.POSITIONS.CENTER,
                    title:W.Resources.get('EDITOR_LANGUAGE', 'SEO_PANEL_TT_ADVANCED_SETTINGS'),
                    buttonSet:this.DialogButtonSet.NONE,
                    helpButtonId:'AdvancedSeoSettingsDialog_learn_more'
                },
                null, true, null, false, true
            );
        }
    });
});
