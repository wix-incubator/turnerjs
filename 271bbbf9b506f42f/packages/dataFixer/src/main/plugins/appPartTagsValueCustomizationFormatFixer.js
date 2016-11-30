define(['lodash'], function (_) {
    'use strict';
    
    return {
        exec: function (pageJson) {
            _(pageJson.data.document_data)
                .filter({type: 'AppPart'})
                .forEach(function (data) {
                    _(data.appLogicCustomizations)
                        .filter({
                           fieldId: 'tagsValue',
                           forType: 'Post',
                           format: '',
                           key: 'value',
                           view: 'SinglePostMediaTop'
                        })
                        .forEach(function (customization) {
                            customization.format = '*';
                        })
                        .value();
                })
                .value();
        }
    };
});
