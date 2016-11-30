define.experiment.newAnimationEditorPart('TextFlyIn.AnimationText', function() {
    return{
        iconUrl: 'animation/icon-animation-text-flyin.png',
        displayName: 'ANIMATION_NAME_TEXT_FLYIN',
        previewParams: {
            duration: 1,
            params:{direction: 'right', split: 'letters'}
        },
        panelControls: {

            duration: {
                label: 'ANIMATION_CONTROL_SPEED',
                type: 'SliderWithLabels',
                value: 2,
                min: 0,
                max: 3,
                step: 1,
                units: '',
                hideInput: true,
                tooltipId: 'Animation_Duration_ttid',
                leftLabel: 'ANIMATION_CONTROL_LABEL_SLOW',
                rightLabel: 'ANIMATION_CONTROL_LABEL_FAST'

            },

            params_direction: {
                type: 'ComboBox',
                label: 'ANIMATION_CONTROL_DIRECTION',
                value: 'right',
                list: [
                    {value: 'top', label: 'ANIMATION_CONTROL_DIRECTION_FROM_TOP'},
                    {value: 'left', label: 'ANIMATION_CONTROL_DIRECTION_FROM_LEFT'},
                    {value: 'bottom', label: 'ANIMATION_CONTROL_DIRECTION_FROM_BOTTOM'},
                    {value: 'right', label: 'ANIMATION_CONTROL_DIRECTION_FROM_RIGHT'}
                ]
            },

            params_split: {
                type: 'ComboBox',
                label: 'ANIMATION_CONTROL_SPLIT_BY',
                value: 'letters',
                list: [
                    {value: 'letters', label: 'ANIMATION_CONTROL_LETTERS'},
                    {value: 'words', label: 'ANIMATION_CONTROL_WORDS'},
                    {value: 'randomLetters', label: 'ANIMATION_CONTROL_RANDOM_LETTERS'},
                    {value: 'randomWords', label: 'ANIMATION_CONTROL_RANDOM_WORDS'}
                ]
            },

//            params_shuffle: {
//                type: 'CheckBox',
//                label: 'ANIMATION_CONTROL_RANDOM',
//                value: false
//            },

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