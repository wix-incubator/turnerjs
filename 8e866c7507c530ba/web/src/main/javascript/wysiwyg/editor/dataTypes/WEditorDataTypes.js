define.dataSchema('Font', {
    'font': "string"
});

define.dataSchema('Document', {
    name: "string",
    mainPage: "string"
});

define.dataSchema('TemplateList', {
    templates: 'array'
});

define.dataSchema('Tooltips', {
    toolTips: 'object'
});

define.dataSchema('PageList', {
    items: 'array'
});

define.dataSchema('ComponentList', {
    title: 'string',
    list: 'array'
});

define.dataSchema('Theme', {
    properties: 'array'
});

define.dataSchema('PropertyList', {
    properties: 'array'
});

define.dataSchema('ColorPropList', {
    properties: 'array'
});

define.dataSchema('StyleList', {
    styleItems: 'object'
});