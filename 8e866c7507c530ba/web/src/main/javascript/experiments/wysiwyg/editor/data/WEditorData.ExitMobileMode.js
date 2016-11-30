define.experiment.dataItem('STYLES.ExitMobileMode',  function (experimentStrategy) {
    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;
    return strategy.merge({
        styleItems:{
            'wysiwyg.common.components.exitmobilemode.viewer.ExitMobileMode': ['emb1']
        }
    });
});
