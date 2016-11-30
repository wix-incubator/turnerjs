define.experiment.newAnimationEditorPart('FoldIn.AnimationNewBehaviors', function() {
    return {
        iconUrl: 'animation/icon-animation-foldin.png',
        displayName: 'ANIMATION_NAME_FOLDIN',
        previewParams: {
            duration: 0.7,
            params: {
                direction: 'left'
            }
        },

        panelControls: {

            params_direction: {
                type: 'ComboBox',
                label: 'ANIMATION_CONTROL_DIRECTION',
                value: 'left',
                list: [
                    {value: 'top', label: 'ANIMATION_CONTROL_DIRECTION_FROM_TOP'},
                    {value: 'right', label: 'ANIMATION_CONTROL_DIRECTION_FROM_RIGHT'},
                    {value: 'bottom', label: 'ANIMATION_CONTROL_DIRECTION_FROM_BOTTOM'},
                    {value: 'left', label: 'ANIMATION_CONTROL_DIRECTION_FROM_LEFT'}
                ]
            },

            duration: {
                label: 'ANIMATION_CONTROL_DURATION',
                type: 'Slider',
                value: 1.2,
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