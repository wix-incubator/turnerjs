define.experiment.dataItem('PROPERTY_PANELS.ExitMobileModeEditorToggle', function(experimentStrategy){
    /** @type bootstrap.managers.experiments.ExperimentStrategy */
    var strategy = experimentStrategy;

    return strategy.merge({
        'items':[{
            'dataType': 'LinkableButton',
            'compType': 'wysiwyg.common.components.exitmobilemode.viewer.ExitMobileMode',
            'panelCompType': 'wysiwyg.editor.components.panels.ExitMobileModePanel',
            'panelSkinType': 'wysiwyg.editor.skins.panels.base.AutoPanelSkin'
        }]
    });
});