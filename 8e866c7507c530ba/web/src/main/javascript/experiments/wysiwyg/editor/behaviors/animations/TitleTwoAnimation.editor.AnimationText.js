define.experiment.newAnimationEditorPart('TitleTwo.AnimationText',  function(){
    return{
        iconUrl: 'animation/icon-animation-text-waves.png',
        displayName: 'ANIMATION_NAME_TITLE_TWO',
        previewParams: {
            duration: 2
        },

        panelControls: {
            duration: {
                label: 'ANIMATION_CONTROL_SPEED',
                type: 'SliderWithLabels',
                value: 1,
                min: 0,
                max: 3,
                step: 1,
                units: '',
                hideInput: true,
                tooltipId: 'Animation_Duration_ttid',
                leftLabel: 'ANIMATION_CONTROL_LABEL_SLOW',
                rightLabel: 'ANIMATION_CONTROL_LABEL_FAST'

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