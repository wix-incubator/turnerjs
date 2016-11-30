define.animationEditorPart('TurnIn', {
    iconUrl: 'animation/icon-animation-turnin.png',
    displayName: 'ANIMATION_NAME_TURNIN',
    previewParams: {
        duration: 0.5,
        direction: 'right'
    },

    panelControls: {
        params_direction: {
            label: 'ANIMATION_CONTROL_DIRECTION',
            type: 'ComboBox',
            value: 'right',
            list:[
                {value: 'left', label: 'ANIMATION_CONTROL_DIRECTION_FROM_LEFT'},
                {value: 'right', label: 'ANIMATION_CONTROL_DIRECTION_FROM_RIGHT'}
            ]
        },

        duration: {
            label: 'ANIMATION_CONTROL_DURATION',
            type: 'Slider',
            value: 1,
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