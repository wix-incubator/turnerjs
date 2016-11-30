define.experiment.newAnimationEditorPart('DropIn.AnimationNewBehaviors', function() {
    return {
        iconUrl: 'animation/icon-animation-dropin.png',
        displayName: 'ANIMATION_NAME_DROPIN',
        previewParams: {
            duration: 0.5
        },

        panelControls: {
            duration: {
                label: 'ANIMATION_CONTROL_DURATION',
                type: 'Slider',
                value: 0.9,
                min: 0,
                max: 4,
                step: 0.05,
                units: '',
                tooltipId: 'Animation_Duration_ttid'
            },

            delay: {
                label: 'ANIMATION_CONTROL_DELAY',
                type: 'Slider',
                value: 0,
                min: 0,
                max: 4,
                step: 0.1,
                units: '',
                tooltipId: 'Animation_Delay_ttid'

            }
        }
    };
});