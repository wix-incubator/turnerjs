define.dataSchema('MultiSelectionProperties', {
    placeholder: {
        'type': 'string',
        'default': 'Enter text here...',
        'description': 'The placeholder for the input skinpart'
    },
    newItemText: {
        'type': 'string',
        'default': '(New)',
        'description': 'The text that will appear on a new item in the dropdown'
    },
    selectionOnly: {
        'type': 'Boolean',
        'default': false,
        'description': 'Restricts component to selection only'
    },
    maxTextLength: {
        'type': 'Number',
        'default': 30,
        'description': 'The max text length for the input skinpart'
    }
});

