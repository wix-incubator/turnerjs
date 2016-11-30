define.experiment.newAnimationEditorPart('TextScrabble.AnimationText', function() {
    return{
        iconUrl: 'animation/icon-animation-text-scrabble.png',
        displayName: 'ANIMATION_NAME_TEXT_SCRABBLE',
        previewParams: {
            duration: 2,
            params:{split: 'words'}
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

            params_split: {
                type: 'ComboBox',
                label: 'ANIMATION_CONTROL_SPLIT_BY',
                value: 'words',
                list: [
                    {value: 'words', label: 'ANIMATION_CONTROL_WORDS'},
                    {value: 'letters', label: 'ANIMATION_CONTROL_LETTERS'}
                ]
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