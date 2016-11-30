define.animationEditorPart('SpinIn', {
    iconUrl: 'animation/icon-animation-spinin.png',
    displayName: 'ANIMATION_NAME_SPININ',
    previewParams: {
        duration: 0.7,
        params: {
            cycles: 2,
            direction: 'cw'
        }
    },

    panelControls: {
        params_cycles: {
            label: 'ANIMATION_CONTROL_CYCLES',
            type: 'Slider',
            value: 5,
            min: 1,
            max: 15,
            step: 1,
            units: ''
        },

        params_direction: {
            label: 'ANIMATION_CONTROL_DIRECTION',
            type: 'ComboBox',
            value: 'cw',
            list:[
                {value: 'cw', label: 'ANIMATION_CONTROL_DIRECTION_CW'},
                {value: 'ccw', label: 'ANIMATION_CONTROL_DIRECTION_CCW'}
            ]
        },

        duration: {
            label: 'ANIMATION_CONTROL_DURATION',
            type: 'Slider',
            value: 1.5,
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