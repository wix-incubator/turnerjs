define.experiment.dataItem('HELP_IDS.ExitMobileModeEditorToggle',  function (experimentStrategy) {
    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;
    return strategy.merge({
        'items': {
            'COMPONENT_PANEL_ExitMobileMode'                : '/node/21902'
        }
    });
});

define.experiment.dataItem('MOBILE_ADD_PANELS.ExitMobileModeEditorToggle',  function (experimentStrategy) {
    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    return strategy.customizeField(function(originalPropertyList) {
        var item = {
            'type'      : 'Button',
            'iconSrc'   : 'buttons/Back-to-desktop.png',
            'toggleMode': false,
            'label'     : 'MOBILE_EXIT_MOBILE_BUTTON_PANEL_MENU',
            'command'   : 'WEditorCommands.AddExitMobileModeButton'
        };
        originalPropertyList.items.splice(originalPropertyList.items.length-1, 0, item);
        return originalPropertyList;
    });
});


