define.animationEditorPart('FadeIn', {
    iconUrl: 'animation/icon-animation-fadein.png',
    displayName: 'ANIMATION_NAME_FADEIN',
    previewParams: {
        duration: 1
    },

    panelControls: {
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
});