define.experiment.dataItem('HELP_IDS.RedirectFeature301', function(experimentStrategy) {
    var strategy = experimentStrategy;
    return strategy.merge({
        items: {
            'Redirect301LearnMore': '/node/22504',
            'Redirect301LearnMoreOnInvalidOldURL': '/node/22574',
            'AdvancedSeoSettingsDialog_learn_more': '/node/23096',
        }
    });
});