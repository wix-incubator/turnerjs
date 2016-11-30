define.experiment.dataItem('COMPONENT_TYPES.ExitMobileModeEditorToggle', function(experimentStrategy){
    /** @type bootstrap.managers.experiments.ExperimentStrategy */
    var strategy = experimentStrategy;

    return strategy.merge({
        'items':{
            'addExitMobileModeBtn': {
                component:function() {
                    return {
                        comp:'wysiwyg.common.components.exitmobilemode.viewer.ExitMobileMode',
                        skin:'wysiwyg.common.components.exitmobilemode.viewer.skins.ExitMobileModeSkin',
                        data:{ 'type':'LinkableButton'},
                        layout:{
                            'width':130,
                            'height':60
                        }
                    };
                }
            }
        }
    });
});