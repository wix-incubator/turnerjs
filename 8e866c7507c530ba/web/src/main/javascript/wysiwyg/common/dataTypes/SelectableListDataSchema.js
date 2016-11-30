define.dataSchema( 'SelectableList', {
    'items'    :  {
        'type':'refList',
        'description':'a list of data items or data queries to select from',
        'default':[]
    },
    'selected' : {
        'type':'ref',
        'description':'the selected data item/query',
        'default': null
    }
});