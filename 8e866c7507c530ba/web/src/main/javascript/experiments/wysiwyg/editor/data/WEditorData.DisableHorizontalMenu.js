define.experiment.dataItem('HELP_IDS.DisableHorizontalMenu', function (experimentStrategy) {

    var strategy = experimentStrategy;

    return strategy.customizeField(function (helpIds) {
        helpIds.items['COMPONENT_PANEL_HorizontalMenu'] = '/node/23861';
        return helpIds;
    });
});