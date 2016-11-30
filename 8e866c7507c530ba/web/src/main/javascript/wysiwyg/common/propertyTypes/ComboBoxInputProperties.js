define.dataSchema('ComboBoxInputProperties', {
    "hasPrompt": {
        'type': 'boolean',
        'default': false,
        'description': 'Display prompt in combo'
    },
    "promptText":{
        'type': 'string',
        'default': '',
        'description': 'The text that will be displayed in the prompt'
    },
    "promptValue":{
        'type': 'number',
        'default': -1,
        'description': 'Data of prompt option'
    }
});