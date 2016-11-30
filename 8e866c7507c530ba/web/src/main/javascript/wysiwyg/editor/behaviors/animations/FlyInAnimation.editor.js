define.animationEditorPart('FlyIn', {
    iconUrl: 'animation/icon-animation-flyin.png',
    displayName: 'ANIMATION_NAME_FLYIN',
    previewParams: {
        duration: 0.5,
        params: {
            direction: 'right'
        }
    },

    panelControls: {
        params_direction: {
            type: 'ComboBox',
            label: 'ANIMATION_CONTROL_DIRECTION',
            value: 'right',
            list:[
                {value: 'top', label: 'ANIMATION_CONTROL_DIRECTION_FROM_TOP'},
                {value: 'top left', label: 'ANIMATION_CONTROL_DIRECTION_FROM_TOP_LEFT'},
                {value: 'top right', label: 'ANIMATION_CONTROL_DIRECTION_FROM_TOP_RIGHT'},
                {value: 'left', label: 'ANIMATION_CONTROL_DIRECTION_FROM_LEFT'},
                {value: 'bottom', label: 'ANIMATION_CONTROL_DIRECTION_FROM_BOTTOM'},
                {value: 'bottom left', label: 'ANIMATION_CONTROL_DIRECTION_FROM_BOTTOM_LEFT'},
                {value: 'bottom right', label: 'ANIMATION_CONTROL_DIRECTION_FROM_BOTTOM_RIGHT'},
                {value: 'right', label: 'ANIMATION_CONTROL_DIRECTION_FROM_RIGHT'}
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
});