define.dataSchema('CheckBox', {
    'extends': 'Boolean',
    indeterminate: {
        'type': 'Boolean',
        'default': false,
        'description': 'Used for three state check box'
    }
});
