define.experiment.component('wysiwyg.editor.components.panels.base.SidePanel.BackgroundReplaceDesign', function (componentDefinition, experimentStrategy) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;
    var strategy = experimentStrategy ;


    def.methods({
        insertPanel: function (thePanel, prevPanelName) {
            //Removed safari delayed panel hack.
            this._delayedInsertPanel(thePanel, prevPanelName);
        }
    });
});
