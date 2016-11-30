define.experiment.component('wysiwyg.editor.components.panels.MobileViewSelectorPanel.ExitMobileModeEditorToggle', function (componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.resources(strategy.merge(['W.Preview', 'W.Commands']));

    def.binds(strategy.merge(['_handleDeletedComponents', '_handleSelectedComponentChange']));

    def.methods({
        _addToggleButtonsSelector: function() {
            this.addInputGroupField(function(panel){
                this.addBreakLine(5);
                this.addInputGroupField(function(panel){
                    this.setNumberOfItemsPerLine(2, '10px');
                    panel._addButtonSelector(this, 'mobile/preview_desktop1.png', {width:183, height:259}, 'regularViewButton', 'MOBILE_VIEW_SELECTOR_REGULAR_DESKTOP_VIEW_TITLE');
                    panel._addButtonSelector(this, 'mobile/preview_optimized1.png', {width:183, height:259}, 'optimizedViewButton', 'MOBILE_VIEW_SELECTOR_OPTIMIZED_VIEW_TITLE');
                }, 'skinless');
            }, 'skinless');
        }
    });
});
