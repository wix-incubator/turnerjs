//Merged
define.animationEditorPart('FloatIn', {
    iconUrl: 'animation/icon-animation-floatin.png',
    displayName: 'ANIMATION_NAME_FLOATIN',
    previewParams: {
        duration: 0.7,
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
                {value: 'left', label: 'ANIMATION_CONTROL_DIRECTION_FROM_LEFT'},
                {value: 'bottom', label: 'ANIMATION_CONTROL_DIRECTION_FROM_BOTTOM'},
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